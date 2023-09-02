package handlers

import (
	"fmt"

	"github.com/ddannyll/prepper/pkg/config"
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
func (p *AIHandler) GetQuestions(c *fiber.Ctx) error {
	i := &SpecifiedQuestion{}
	err := c.BodyParser(i)
	if err != nil {
		fmt.Println(err)
	}

	openAIKey := p.gateway_key
	newAI := NewAI(openAIKey)

	questions, err := newAI.GetQuestion(c.Context(), i)
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
//	@Produce	plain
//	@Success	200
//	@Router		/ai/analyse [post]
func (p *AIHandler) Analyse(c *fiber.Ctx) error {
	r := &AnalysisRequest{}
	err := c.BodyParser(r)
	if err != nil {
		fmt.Println(err)
	}

	openAIKey := p.gateway_key
	newAI := NewAI(openAIKey)

	response, err := newAI.AnalyseResponse(c.Context(), r)
	if err != nil {
		fmt.Println(err)
	}

	c.SendString(response)
	return nil
}

type SpecifiedQuestion struct {
	JobPosition  string
	QuestionType string
}

func analyseResponse(ctx context.Context, c aigateway.AIGatewayServiceClient, r *AnalysisRequest) string {
	question := r.Question
	answer := r.Answer

	req := &aigateway.CompleteTextRequest{
		Prompt: fmt.Sprintf("Evaluate the following answer '%v' in response to this question '%v'. Provide two dot points, one for good feedback and one for potential improvements.", answer, question),
		// ResponseExample: `{"good": [You answered the question.] "bad": [You should elaborate on your answer a bit more.]}`,
	}
	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(resp.Raw)

	return resp.Raw
}

type AnalysisRequest struct {
	Question string
	Answer   string
}
