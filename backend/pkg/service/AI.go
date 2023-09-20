package service

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/haguro/elevenlabs-go"
	"github.com/sashabaranov/go-openai"

	"github.com/ddannyll/prepper/pkg/config"
)

type AI struct {
	OpenAiKey     string
	ElevenLabsKey string
}

func NewAI(env config.EnvVars) *AI {
	newAI := &AI{
		OpenAiKey:     env.GATEWAY_KEY,
		ElevenLabsKey: env.ELEVEN_LABS,
	}
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
		Model:     openai.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt: fmt.Sprintf(
			"You are a senior hiring manager. Create a single %s one sentence question for a %s. Return question in JSON format only.",
			questionType,
			position,
		),
		Temperature: 1,
	}

	c := openai.NewClient(o.OpenAiKey)

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
		Model:     openai.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt: fmt.Sprintf(
			"You are a recruiter at a company reviewing an applications response to interview questions. Evaluate the following answer '%v' in response to this question '%v'. Provide multiple dot points for good feedback and multiple dot points for potential improvements, Return the evaluation in JSON format { \"good\": [], \"bad\": [] }.",
			answer,
			question,
		),
		Temperature: 0,
	}

	c := openai.NewClient(o.OpenAiKey)
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
	c := openai.NewClient(o.OpenAiKey)

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

func (o *AI) GetCuratedQuestions(
	ctx context.Context,
	companyName string,
	jobDescription string,
	questionsTags [][]string,
) ([]string, error) {
	// Make the client

	questionsTagsPrompt := ""
	for _, questionTags := range questionsTags {
		questionsTagsPrompt = fmt.Sprintf(
			"%s\n- 1 '%v' question",
			questionsTagsPrompt,
			questionTags,
		)
	}

	completionRequest := openai.CompletionRequest{
		Model:     openai.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt: fmt.Sprintf(
			"You are a senior hiring manager at %s. Given the following job description: \n\n---%s---\n\n Curate single sentence interview questions according to below:\n%s\n\n format the questions into a JSON array of strings, removing the question type. Only return JSON, do not put any random text around the JSON.",
			companyName,
			jobDescription,
			questionsTagsPrompt,
		),
		Temperature: 0,
	}

	c := openai.NewClient(o.OpenAiKey)

	resp, err := c.CreateCompletion(ctx, completionRequest)
	if err != nil {
		// TODO fix this -> figure out the correct way to handle errors
		return []string{}, err
	}

	// delete all text before the first [

	tt := resp.Choices[0].Text
	tt = tt[strings.Index(resp.Choices[0].Text, "["):]

	// delete all text after the last ]
	tt = tt[:strings.LastIndex(tt, "]")+1]

	res := []string{}

	if jsonErr := json.Unmarshal([]byte(tt), &res); jsonErr != nil {
		return res, jsonErr
	}
	return res, nil
}

func (o *AI) Text2Voice(ctx context.Context, questionread string) ([]byte, error) {
	// Create a new client
	client := elevenlabs.NewClient(ctx, o.ElevenLabsKey, 30*time.Second)
	// Create a TextToSpeechRequest
	ttsReq := elevenlabs.TextToSpeechRequest{
		Text:    questionread,
		ModelID: "eleven_monolingual_v1",
	}
	// pick a random voice from JpSZVyDoK7Yi7NHGnId0, JpSZVyDoK7Yi7NHGnId1, JpSZVyDoK7Yi7NHGnId2

	voiceChoice := []string{"JpSZVyDoK7Yi7NHGnId0", "21m00Tcm4TlvDq8ikWAM"}
	// pick a random voice
	randomIndex := rand.Intn(len(voiceChoice))
	voiceId := voiceChoice[randomIndex]

	// Call the TextToSpeech method on the client, using the "Adam"'s voice ID.
	audio, err := client.TextToSpeech(voiceId, ttsReq)
	if err != nil {
		return nil, err
	}

	// Write the audio file bytes to disk
	// if err := os.WriteFile("adam.mp3", audio, 0644); err != nil {
	// 	log.Fatal(err)
	// }

	return audio, nil
}

type CoverLetter struct {
	Name       string
	Education  string
	Position   string
	Company    string
	Reasons    string // reasons to join the company
	Experience string // previous experience wanted in the cover letter
}

func (o *AI) GenerateCoverLetter(ctx context.Context, j *CoverLetter) (string, error) {
	completionRequest := openai.CompletionRequest{
		Model:     openai.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt: fmt.Sprintf(
			"Create a cover letter for %s from %s for a %s role at %s. Include the following reasons and previous experience: %s, %s. Only return the cover letter, do not put any text around. Ensure you write paragraphs.",
			j.Name,
			j.Education,
			j.Position,
			j.Company,
			j.Reasons,
			j.Experience,
		),
		Temperature: 1,
	}

	c := openai.NewClient(o.OpenAiKey)

	resp, err := c.CreateCompletion(ctx, completionRequest)
	if err != nil {
		return "", err
	}

	return resp.Choices[0].Text, nil
}
