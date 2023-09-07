package handlers

import (
	"log"

	"github.com/ddannyll/prepper/db"
	"github.com/ddannyll/prepper/pkg/config"
	"github.com/ddannyll/prepper/pkg/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
)

type ApplicationHandler struct {
	SessionStore *session.Store
	dbClient     *db.PrismaClient
	aiService    *service.AI
}

func NewApplicationHandler(
	sessionStore *session.Store,
	config config.EnvVars,
	dbClient *db.PrismaClient,
	aiService *service.AI,
) *ApplicationHandler {
	return &ApplicationHandler{
		SessionStore: sessionStore,
		dbClient:     dbClient,
		aiService:    aiService,
	}
}

type applicationCreateBody struct {
	Name           string `json:"name" validate:"required" example:"SafetyCulture"`
	Description    string `json:"description" example:"SafetyCulture is an Australian-based global technology company that specialises in building inspection apps for the web and mobile devices."`
	JobDescription string `json:"jobDescription" validate:"required" example:"Looking for an engineer to join our team."`
	// icon link?
	Icon string `json:"icon" example:"https://www.safetyculture.com/wp-content/uploads/2020/10/safetyculture-logo.svg"`
} //@name ApplicationCreateBody

type applicationCreateSuccessResponse struct {
	Id string `json:"id" example:"1337"`

	Name           string `json:"name" validate:"required" example:"SafetyCulture"`
	Description    string `json:"description" example:"SafetyCulture is an Australian-based global technology company that specialises in building inspection apps for the web and mobile devices."`
	JobDescription string `json:"jobDescription" validate:"required" example:"Looking for an engineer to join our team."`
	CreatedAt      string `json:"createdAt" example:"2021-07-01T00:00:00.000Z"`
	Icon           string `json:"icon" example:"https://www.safetyculture.com/wp-content/uploads/2020/10/safetyculture-logo.svg"`
} //@name ApplicationCreateResponse

// CreateApplication godoc
//
//	@Summary		Create an application for the user
//	@description	an application has some properties
//	@Tags			application
//	@Accept			json
//	@Param			ApplicationCreateBody	body applicationCreateBody true "Application"
//	@Produce		json
//	@Success		200	{object} applicationCreateSuccessResponse
//	@Router			/application/create [post]
func (u *ApplicationHandler) ApplicationCreate(c *fiber.Ctx) error {

	userID := c.Locals("userID").(string)

	var application applicationCreateBody
	if err := parseAndValidateBody(c, &application); err != nil {
		return err
	}

	createdApplication, createError := u.dbClient.Application.CreateOne(
		db.Application.Name.Set(application.Name),
		db.Application.Description.Set(application.Description),
		db.Application.JobDescription.Set(application.JobDescription),
		db.Application.Icon.Set(application.Icon),

		db.Application.Owner.Link(
			db.User.ID.Equals(userID),
		),
	).Exec(c.Context())

	if createError != nil {
		return createError
	}

	resp := applicationCreateSuccessResponse{
		Id:             createdApplication.ID,
		Name:           createdApplication.Name,
		Description:    createdApplication.Description,
		JobDescription: createdApplication.JobDescription,
		CreatedAt:      createdApplication.CreatedAt.String(),
		Icon:           "",
	}

	return c.JSON(resp)
}

// ApplicationMe godoc
//
//	@Summary	Get user's applications
//	@description
//	@Tags		application
//	@Produce	json
//	@Success	200
//	@Failure	401
//	@Router		/application/me [get]
func (u *ApplicationHandler) ApplicationMe(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	if userID == "" {
		log.Println("userID is empty")
		return fiber.ErrUnauthorized
	}

	// applications, fetchError := u.dbClient.Application.FindMany(
	// 	db.Application.Owner.Where(
	// 		db.User.ID.Equals(userID),
	// 	),
	// ).Exec(c.Context())

	// find many order by created at desc
	applications, fetchError := u.dbClient.Application.FindMany(
		db.Application.Owner.Where(
			db.User.ID.Equals(userID),
		),
	).OrderBy(
		db.Application.CreatedAt.Order(db.DESC),
	).Exec(c.Context())

	if fetchError != nil {
		return fetchError
	}

	resp := applications

	return c.JSON(resp)
}

type applicationQuestionsBody struct {
	Id              string `json:"id" example:"1337"`
	NumberQuestions int    `json:"numberQuestions" example:"5"`
} //@name applicationQuestionsBody

type question struct {
	QuestionPrompt string   `json:"questionPrompt" example:"What is your name?"`
	tags           []string `json:"tags" example:"[tag1, tag2, tag3]"`
} //@name question

// ApplicationQuestions godoc
//
// @Summary		Get questoins for the user
// @description	an application has some properties
// @Tags			application
// @Accept			json
// @Param			applicationQuestionsBody	body applicationQuestionsBody true "Application"
// @Produce		json
// @Success		200	{object} GetQuestionsFromJobDescriptionResponse
// @Router			/application/questions [post]
func (u *ApplicationHandler) ApplicationQuestions(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	if userID == "" {
		log.Println("userID is empty")
		return fiber.ErrUnauthorized
	}

	// applications, fetchError := u.dbClient.Application.FindMany(
	// 	db.Application.Owner.Where(
	// 		db.User.ID.Equals(userID),
	// 	),
	// ).Exec(c.Context())

	var questionBody applicationQuestionsBody
	if err := parseAndValidateBody(c, &questionBody); err != nil {
		return err
	}

	// find the application
	application, fetchError := u.dbClient.Application.FindUnique(
		db.Application.ID.Equals(questionBody.Id),
	).Exec(c.Context())

	log.Println("WHAT IS THE USER ID", userID)
	log.Println("QID", questionBody.Id)

	if fetchError != nil {
		return fetchError
	}

	// get the job description
	jobDescription := application.JobDescription
	numberQuestions := questionBody.NumberQuestions

	// if it's more than 5 questions, return an error
	if numberQuestions > 5 {
		return fiber.NewError(fiber.StatusBadRequest, "Number of questions must be less than 5")
	}

	// get the questions

	resp, er := u.aiService.GetQuestionsFromJobDescription(c.Context(), jobDescription, numberQuestions, application.Name)

	if er != nil {
		return er
	}
	// use the job description to get the questions

	log.Println("RESPONSE", resp)
	return c.JSON(resp)
}
