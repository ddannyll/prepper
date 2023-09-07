package handlers

import (
	"log"

	"github.com/ddannyll/prepper/db"
	"github.com/ddannyll/prepper/pkg/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
)

type ApplicationHandler struct {
	SessionStore *session.Store
	dbClient     *db.PrismaClient
}

func NewApplicationHandler(sessionStore *session.Store, config config.EnvVars, dbClient *db.PrismaClient) *ApplicationHandler {
	return &ApplicationHandler{
		SessionStore: sessionStore,
		dbClient:     dbClient}
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
