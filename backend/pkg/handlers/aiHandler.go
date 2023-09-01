package handlers

import (
	"context"
	"fmt"
	"log"

	"github.com/SafetyCulture/s12-apis-go/aigateway/v1"
	"github.com/ddannyll/prepper/pkg/aiGateway"
	"github.com/gofiber/fiber/v2"
)

type AIHandler struct{}

func NewAIHandler() *AIHandler {
	return &AIHandler{}
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
	// TODO figure this out l8rrrr
	client := aiGateway.GetAIClient()
	adminToken, err := aiGateway.GetSoterAdminToken()

	log.Println(adminToken)
	log.Println(client)

	if err != nil {
		log.Println(err)
		return err
	}

	outCtx := aiGateway.GetOutgoingContext(adminToken)
	questions := generateQuestions(outCtx, client, i)

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
	client := aiGateway.GetAIClient()

	adminToken, err := aiGateway.GetSoterAdminToken()

	if err != nil {

		return err
	}

	outCtx := aiGateway.GetOutgoingContext(adminToken)
	err = c.BodyParser(r)
	if err != nil {
		fmt.Println(err)
	}
	response := analyseResponse(outCtx, client, r)
	c.SendString(response)

	return nil

}

func generateQuestions(ctx context.Context, c aigateway.AIGatewayServiceClient, i *SpecifiedQuestion) string {
	questionType := i.QuestionType
	position := i.JobPostion
	req := &aigateway.CompleteTextRequest{
		Prompt: fmt.Sprintf("You are a senior hiring manager. Create a %v question for a %v role.", questionType, position),
	}

	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)

	}
	fmt.Println(resp.Raw)

	return resp.Raw
}

type SpecifiedQuestion struct {
	JobPostion   string
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

	resp.
	return resp.Raw
}

type AnalysisRequest struct {
	Question string
	Answer   string
}
