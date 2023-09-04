package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ddannyll/prepper/pkg/config"
	"github.com/sashabaranov/go-openai"
)

type AI struct {
	Key string
}

func NewAI(env config.EnvVars) *AI {
	newAI := &AI{Key: env.GATEWAY_KEY}
	return newAI
}

type SpecificQuestion struct {
	JobPosition string
	QuestionType string
}
func (o *AI) GetQuestion(ctx context.Context, i *SpecificQuestion) (string, error) {
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

type QuestionAnswerPair struct {
	Question string
	Answer string
}
type Analysis struct {
	Good []string `json:"good"`
	Bad []string `json:"bad"`
}
func (o *AI) AnalyseResponse(ctx context.Context, r *QuestionAnswerPair) (Analysis, error) {
	question := r.Question
	answer := r.Answer
	
	noWhiteSpace := strings.ReplaceAll(answer, " ", "")
	if len(noWhiteSpace) == 0 {
		return Analysis{
			Bad: []string{"No response was given"},
			Good: []string{},
		}, nil
	}
	words := strings.Split(answer, "")
	if len(words) < 25 {
		return Analysis{
			Bad: []string{"Response too short to be processed by AI"},
			Good: []string{},
		}, nil
	}

	completionRequest := openai.CompletionRequest{
		Model:       openai.GPT3TextDavinci003,
		MaxTokens:   2000,
		Prompt:      fmt.Sprintf("You are a recruiter at a company reviewing an applications response to interview questions. Evaluate the following answer '%v' in response to this question '%v'. Provide multiple dot points for good feedback and multiple dot points for potential improvements, Return the evaluation in JSON format { \"good\": [], \"bad\": [] }.", answer, question),
		Temperature: 0,
	}

	c := openai.NewClient(o.Key)
	resp, err := c.CreateCompletion(ctx, completionRequest)

	analysis := Analysis{}
	if err != nil {
		return analysis, err
	}

	json.Unmarshal([]byte(resp.Choices[0].Text), &analysis)

	return analysis, nil
}
