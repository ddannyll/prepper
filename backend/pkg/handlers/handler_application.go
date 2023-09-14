package handlers

import (
	"log"
	"sync"

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
	curatedCache sync.Map
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

type ApplicationCreateBody struct {
	Name           string     `json:"name" validate:"required" example:"SafetyCulture"`
	JobDescription string     `json:"jobDescription" validate:"required" example:"Looking for an engineer to join our team."`
	Questions      [][]string `json:"questions"`
} //@name ApplicationCreateBody

type ApplicationCreateSuccessResponse struct {
	Id string `json:"id" example:"1337"`

	Name           string `json:"name" validate:"required" example:"SafetyCulture"`
	JobDescription string `json:"jobDescription" validate:"required" example:"Looking for an engineer to join our team."`
	CreatedAt      string `json:"createdAt" example:"2021-07-01T00:00:00.000Z"`
} //@name ApplicationCreateResponse

// CreateApplication godoc
//
//	@Summary		Create an application for the user
//	@description	an application has some properties
//	@Tags			application
//	@Accept			json
//	@Param			ApplicationCreateBody	body ApplicationCreateBody true "Application"
//	@Produce		json
//	@Success		200	{object} ApplicationCreateSuccessResponse
//	@Router			/application/create [post]
func (u *ApplicationHandler) ApplicationCreate(c *fiber.Ctx) error {

	userID := c.Locals("userID").(string)

	var application ApplicationCreateBody
	if err := parseAndValidateBody(c, &application); err != nil {
		return err
	}

	createdApplication, createError := u.dbClient.Application.CreateOne(
		db.Application.Name.Set(application.Name),
		db.Application.JobDescription.Set(application.JobDescription),
		db.Application.Owner.Link(
			db.User.ID.Equals(userID),
		),
	).Exec(c.Context())
	if createError != nil {
		return createError
	}

	wg := sync.WaitGroup{}
	wg.Add(len(application.Questions))

	for i, q := range application.Questions {
		// i cant find a "createMany" for goPrisma => could do this with go routines?
		go func(wg *sync.WaitGroup, questionNumber int, questionTags []string) {
			defer wg.Done()
			_, err := u.dbClient.QuestionType.CreateOne(
				db.QuestionType.Number.Set(questionNumber),
				db.QuestionType.Application.Link(
					db.Application.ID.Equals(createdApplication.ID),
				),
				db.QuestionType.Tags.Set(questionTags),
			).Exec(c.Context())
			if err != nil {
				log.Println("failed to create question")
			}
		}(&wg, i+1, q)
	}
	wg.Wait()

	resp := ApplicationCreateSuccessResponse{
		Id:             createdApplication.ID,
		Name:           createdApplication.Name,
		JobDescription: createdApplication.JobDescription,
		CreatedAt:      createdApplication.CreatedAt.String(),
	}

	return c.JSON(resp)
}

// ApplicationMe godoc
//
//	@Summary	Get user's applications
//	@description
//	@Tags		application
//	@Produce	json
//	@Success	200 {object} []db.InnerApplication
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

type QuestionType struct {
	Id   string   `json:"id"`
	Tags []string `json:"tags"`
}
type ApplicationQuestionResponse struct {
	Questions []QuestionType `json:"questions"`
}

// ApplicationQuestions godoc
//
//		@Summary	Get an user's application question types
//		@description
//		@Tags		application
//	 @Param applicationId  path  string true "applicationId"
//		@Produce	json
//		@Success	200 {object} ApplicationQuestionResponse
//		@Failure	401
//	 @Failure  403 "test"
//		@Router		/application/:applicationId/questions [get]
func (u *ApplicationHandler) ApplicationQuestions(c *fiber.Ctx) error {
	userId := c.Locals("userID").(string)
	if userId == "" {
		return fiber.ErrUnauthorized
	}

	appId := c.Params("applicationId")

	app, err := u.dbClient.Application.FindUnique(
		db.Application.ID.Equals(appId),
	).Exec(c.Context())
	if err != nil || app.OwnerID != userId {

		return fiber.NewError(fiber.StatusForbidden)
	}

	questions, err := u.dbClient.QuestionType.FindMany(
		db.QuestionType.ApplicationID.Equals(app.ID),
	).OrderBy(db.QuestionType.Number.Order(db.ASC)).Exec(c.Context())
	if err != nil {
		return err
	}

	response := ApplicationQuestionResponse{Questions: []QuestionType{}}
	for _, q := range questions {
		response.Questions = append(response.Questions, QuestionType{
			Id:   q.ID,
			Tags: q.Tags,
		})
	}
	return c.JSON(response)
}

type GeneratedQuestion struct {
	Tags           []string `json:"tags"`
	QuestionPrompt string   `json:"questionPrompt"`
	AudioLink      []byte   `json:"audioLink"`
}

// GetAIQuestions godoc
//
//		@Summary	Use AI to generate questions based on questions tags in a specified application
//		@description
//		@Tags		application
//	 @Param applicationId  path  string true "applicationId"
//		@Produce	json
//		@Success	200 {object} []GeneratedQuestion
//		@Failure	401
//	 @Failure  403 "test"
//		@Router		/application/:applicationId/questions/generate [get]
func (u *ApplicationHandler) GetAIQuestions(c *fiber.Ctx) error {
	userId := c.Locals("userID").(string)
	if userId == "" {
		return fiber.ErrUnauthorized
	}
	appId := c.Params("applicationId")

	cacheKey := appId // You can expand on this key as needed.
	if data, found := u.curatedCache.Load(cacheKey); found {
		log.Println("hit cache")

		return c.JSON(data.([]GeneratedQuestion))
	}

	app, err := u.dbClient.Application.FindUnique(
		db.Application.ID.Equals(appId),
	).Exec(c.Context())
	if err != nil || app.OwnerID != userId {
		return fiber.NewError(fiber.StatusForbidden)
	}

	if app.Name == "Willy Wonka's Chocolate Factory" {
		cacheKey = "WillyWonka"
		if data, found := u.curatedCache.Load(cacheKey); found {
			log.Println("hit cache")
			return c.JSON(data.([]GeneratedQuestion))
		}
	}

	questionsTags, err := u.dbClient.QuestionType.FindMany(
		db.QuestionType.ApplicationID.Equals(app.ID),
	).OrderBy(db.QuestionType.Number.Order(db.ASC)).Exec(c.Context())
	if err != nil {
		return err
	}

	questions := [][]string{}
	for _, questionTags := range questionsTags {
		questions = append(questions, questionTags.Tags)
	}

	curatedQuestions, err := u.aiService.GetCuratedQuestions(c.Context(), app.Name, app.JobDescription, questions)
	if err != nil {
		return err
	}

	if len(curatedQuestions) != len(questions) {
		return fiber.ErrInternalServerError
	}
	curatedQuestionsTagged := []GeneratedQuestion{}

	questionsToRead := []([]byte){}
	for _, q := range curatedQuestions {

		if app.Name == "Willy Wonka's Chocolate Factory" {
			questionsToRead = append(questionsToRead, []byte{})
		} else {
			// send the questions to read to elevenlabs
			audioData, err := u.aiService.Text2Voice(c.Context(), q)
			if err != nil {
				log.Println(err)
				// empty audio data
				questionsToRead = append(questionsToRead, []byte{})
			}
			questionsToRead = append(questionsToRead, audioData)
		}
	}

	for i, curatedQuestion := range curatedQuestions {
		curatedQuestionsTagged = append(curatedQuestionsTagged, GeneratedQuestion{
			QuestionPrompt: curatedQuestion,
			Tags:           questions[i],
			AudioLink:      questionsToRead[i],
		})
	}

	u.curatedCache.Store(cacheKey, curatedQuestionsTagged)

	return c.JSON(curatedQuestionsTagged)
}
