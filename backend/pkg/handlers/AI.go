package handlers

import (
	"context"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

type AI struct {
	Key string
}

func NewAI(openAIKey string) *AI {
	newAI := &AI{Key: openAIKey}
	return newAI
}

func (o *AI) GetQuestion(ctx context.Context, i *SpecifiedQuestion) (string, error) {
	position := i.JobPosition
	questionType := i.QuestionType

	completionRequest := openai.CompletionRequest{
		Model:       openai.GPT3TextDavinci003,
		MaxTokens:   2000,
		Prompt:      fmt.Sprintf("You are a senior hiring manager. Create a single %s one sentence question for a %s. Return question in JSON format only.", questionType, position),
		Temperature: 1,
	}

	c := openai.NewClient(o.Key)
	resp, err := c.CreateCompletion(ctx, completionRequest)
	if err != nil {
		return "", err
	}

	return resp.Choices[0].Text, nil
}

func (o *AI) AnalyseResponse(ctx context.Context, r *AnalysisRequest) (string, error) {
	question := r.Question
	answer := r.Answer

	completionRequest := openai.CompletionRequest{
		Model:       openai.GPT3TextDavinci003,
		MaxTokens:   2000,
		Prompt:      fmt.Sprintf("Evaluate the following answer '%v' in response to this question '%v'. Provide multiple dot points for good feedback and multiple dot points for potential improvements. Return the evaluation in JSON format { 'good': [], 'bad': [] }.", answer, question),
		Temperature: 0,
	}

	c := openai.NewClient(o.Key)
	resp, err := c.CreateCompletion(ctx, completionRequest)
	if err != nil {
		return "", err
	}

	return resp.Choices[0].Text, nil
}
