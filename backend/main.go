package main

import (
	"context"
	"fmt"

	"github.com/SafetyCulture/s12-apis-go/aigateway/v1"
	"github.com/gofiber/fiber/v2"
)

var identity string = "ai-gateway-examples"
var namespace string = "actions"

func main() {
	//Get an instance of an AIGateway client
	aiClient := getClient()

	// Get a Soter admin token
	adminToken, err := getSoterAdminToken()
	if err != nil {
		panic(err)
	}
	// Put the token in an outgoing context
	outCtx := getOutgoingContext(adminToken)

	app := fiber.New()

	questions := generateQuestions(outCtx, aiClient)
	app.Get("/questions", func(ctx *fiber.Ctx) error {
		ctx.SendString(questions)
		return nil
	})

	// analysis := analyseResponse(outCtx, aiClient)

	app.Post("/analysis", func(ctx *fiber.Ctx) error {
		r := &AnalysisRequest{}
		err := ctx.BodyParser(r)
		if err != nil {
			fmt.Println(err)
		}
		response := analyseResponse(outCtx, aiClient, r)
		ctx.SendString(response)
		return nil
	})

	app.Listen(":8080")
}

type AnalysisRequest struct {
	Question string
	Answer   string
}

func generateQuestions(ctx context.Context, c aigateway.AIGatewayServiceClient) string {
	req := &aigateway.CompleteTextRequest{
		Prompt: "You are a senior hiring manager. Create a list of questions to ask when hiring for a junior software engineer. Return questions in a json array.",
	}
	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)
	}

	return resp.Raw

}

func analyseResponse(ctx context.Context, c aigateway.AIGatewayServiceClient, r *AnalysisRequest) string {
	question := r.Question
	answer := r.Answer

	// ["qwqewq", "hjgjhg"]

	req := &aigateway.CompleteTextRequest{
		Prompt: fmt.Sprintf("Evaluate the following answer '%v' in response to this question '%v'. Provide potential improvements for the answer.", answer, question),
	}
	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(resp.Raw)

	return resp.Raw
}
