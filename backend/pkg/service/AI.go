package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/ddannyll/prepper/pkg/config"
	"github.com/haguro/elevenlabs-go"
	"github.com/sashabaranov/go-openai"
)

type AI struct {
	Key string
}

func NewAI(env config.EnvVars) *AI {

	fmt.Println("Key: ", env.GATEWAY_KEY)

	newAI := &AI{Key: env.GATEWAY_KEY}
	return newAI
}

type SpecificQuestion struct {
	JobPosition  string
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
	Answer   string
}
type Analysis struct {
	Good []string `json:"good"`
	Bad  []string `json:"bad"`
}

type Voice2TextResponse struct {
	Text string `json:"text"`
}

func (o *AI) AnalyseResponse(ctx context.Context, r *QuestionAnswerPair) (Analysis, error) {
	question := r.Question
	answer := r.Answer

	noWhiteSpace := strings.ReplaceAll(answer, " ", "")
	if len(noWhiteSpace) == 0 {
		return Analysis{
			Bad:  []string{"No response was given"},
			Good: []string{},
		}, nil
	}
	words := strings.Split(answer, "")
	if len(words) < 25 {
		return Analysis{
			Bad:  []string{"Response too short to be processed by AI"},
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

func (o *AI) Voice2Text(ctx context.Context, audioPath string) (Voice2TextResponse, error) {

	// Make the client
	c := openai.NewClient(o.Key)

	// Create the request
	req := openai.AudioRequest{

		Model:    openai.Whisper1,
		FilePath: audioPath,
	}

	resp, err := c.CreateTranscription(ctx, req)

	if err != nil {
		// TODO fix this -> figure out the correct way to handle errors
		return Voice2TextResponse{}, err
	}

	return Voice2TextResponse{
		Text: resp.Text,
	}, nil
}

type GetQuestionsFromJobDescriptionResponse struct {
	Text string `json:"text"`
}

func (o *AI) GetQuestionsFromJobDescription(ctx context.Context, jobDescription string, numberOfQuestions int, companyName string) (GetQuestionsFromJobDescriptionResponse, error) {

	// Make the client

	completionRequest := openai.CompletionRequest{
		Model:     openai.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt: fmt.Sprintf("You are a senior hiring manager at %s. Create %d question(s) for this job description, with atleast 1 question about the company itself: %s\nReturn question in JSON array only:\n{questionPrompt, tags}\n here questionPrompt is a single sentence and tags is an array containing tags which describe this question.\n Again, don't write anything but JSON array, don't put any random text at the start", companyName,
			numberOfQuestions, jobDescription),
		Temperature: 0,
	}

	c := openai.NewClient(o.Key)

	resp, err := c.CreateCompletion(ctx, completionRequest)

	if err != nil {
		// TODO fix this -> figure out the correct way to handle errors
		return GetQuestionsFromJobDescriptionResponse{}, err
	}

	// delete all text before the first [

	tt := resp.Choices[0].Text
	tt = tt[strings.Index(resp.Choices[0].Text, "["):]

	// delete all text after the last ]
	tt = tt[:strings.LastIndex(tt, "]")+1]

	log.Println(resp.Choices[0].Text)

	return GetQuestionsFromJobDescriptionResponse{
		Text: tt,
	}, nil
}

func Text2Voice(questionread string) ([]byte, error) {
	// Create a new client
	client := elevenlabs.NewClient(context.Background(), "e290e9a38b37ac5e39577ec36c35b1d3", 30*time.Second)

	// Create a TextToSpeechRequest
	ttsReq := elevenlabs.TextToSpeechRequest{
		Text:    questionread,
		ModelID: "eleven_monolingual_v1",
	}

	// Call the TextToSpeech method on the client, using the "Adam"'s voice ID.
	audio, err := client.TextToSpeech("pNInz6obpgDQGcFmaJgB", ttsReq)
	if err != nil {
		return nil, err
	}

	return audio, nil
}
