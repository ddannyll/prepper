package main

import (
	"context"
	"encoding/json"
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

	questions := generateQuestions(outCtx, aiClient)

	app := fiber.New()
	app.Get("/questions", func(ctx *fiber.Ctx) error {
		ctx.SendString(questions)
		return nil
	})

	analysis := analyseResponse(outCtx, aiClient)

	app.Get("/analysis", func(ctx *fiber.Ctx) error {
		ctx.SendString(analysis)
		return nil
	})

	app.Listen(":8080")
}

func generateQuestions(ctx context.Context, c aigateway.AIGatewayServiceClient) string {
	req := &aigateway.CompleteTextRequest{
		Prompt: "You are a senior hiring manager. Create a list of questions to ask when hiring for a junior software engineer.",
	}
	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(resp.Raw)

	return resp.Raw

}

func analyseResponse(ctx context.Context, c aigateway.AIGatewayServiceClient) []byte {
	question := "how are you"
	answer := "im good thanks"

	req := &aigateway.CompleteTextRequest{
		Prompt: fmt.Sprintf("Evaluate the following answer '%v' in response to this question '%v'", answer, question),
	}
	resp, err := c.CompleteText(ctx, req)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(resp.Raw)

	// Marshal the Person struct to JSON.
	json, err := json.Marshal(resp.Raw)

	return json
}
