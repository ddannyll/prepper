package handlers

import (
	"fmt"

	"github.com/ddannyll/prepper/pkg/config"
	"github.com/ddannyll/prepper/pkg/service"
	"github.com/gofiber/fiber/v2"
)

type AIHandler struct {
	// OpenAI gateway key
	gateway_key string
}

func NewAIHandler(e config.EnvVars) *AIHandler {
	newAiHandler := &AIHandler{gateway_key: e.GATEWAY_KEY}
	return newAiHandler
}

// GetQuestions godoc
//
//	@Summary	Generate questions given a job position and type of questions wanted
//	@Tags		ai
//	@Accept		json
//	@Produce	plain
//	@Success	200
//	@Router		/ai/getQuestions [get]
type SpecifiedQuestion struct {
	JobPosition  string `json:"jobPosition"`
	QuestionType string `json:"questionType"`
}
func (p *AIHandler) GetQuestions(c *fiber.Ctx) error {
	i := &SpecifiedQuestion{}
	err := c.BodyParser(i)
	if err != nil {
		fmt.Println(err)
	}

	openAIKey := p.gateway_key
	newAI := service.NewAI(openAIKey)

	questions, err := newAI.GetQuestion(c.Context(), &service.SpecificQuestion{
		QuestionType: i.QuestionType,
		JobPosition: i.JobPosition,
	})
	if err != nil {
		fmt.Println(err)
	}

	c.SendString(questions)
	return nil
}

// Analyse godoc
//
//	@Summary	analyse an answer to a question
//	@Tags		ai
//	@Accept		json
//  @Param    QAPair body AnalysisRequest true "Question and Answer to be analysed by AI"
//	@Produce	json
//	@Success	200 {object} service.Analysis
//	@Router		/ai/analyse [post]
func (p *AIHandler) Analyse(c *fiber.Ctx) error {
	r := &AnalysisRequest{}
	err := c.BodyParser(r)
	if err != nil {
		fmt.Println(err)
	}

	openAIKey := p.gateway_key
	newAI := service.NewAI(openAIKey)

	response, err := newAI.AnalyseResponse(c.Context(), &service.QuestionAnswerPair{
		Question: r.Question,
		Answer: r.Answer,
	})
	if err != nil {
		fmt.Println(err)
	}
	
	return c.JSON(response)	
}
type AnalysisRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

