package handlers

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"

	"github.com/ddannyll/prepper/pkg/service"
)

type AIHandler struct {
	// OpenAI gateway key
	aiService *service.AI
}

func NewAIHandler(aiService *service.AI) *AIHandler {
	newAiHandler := &AIHandler{
		aiService: aiService,
	}
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

	questions, err := p.aiService.GetQuestion(c.Context(), &service.SpecificQuestion{
		QuestionType: i.QuestionType,
		JobPosition:  i.JobPosition,
	})
	if err != nil {
		fmt.Println(err)
	}

	c.SendString(questions)
	return nil
}

// Analyse godoc
//
//		@Summary	analyse an answer to a question
//		@Tags		ai
//		@Accept		json
//	 @Param    QAPair body AnalysisRequest true "Question and Answer to be analysed by AI"
//		@Produce	json
//		@Success	200 {object} service.Analysis
//		@Router		/ai/analyse [post]
func (p *AIHandler) Analyse(c *fiber.Ctx) error {
	r := &AnalysisRequest{}
	err := c.BodyParser(r)
	if err != nil {
		fmt.Println(err)
	}

	response, err := p.aiService.AnalyseResponse(c.Context(), &service.QuestionAnswerPair{
		Question: r.Question,
		Answer:   r.Answer,
	})
	if err != nil {
		fmt.Println(err)
		return fiber.NewError(fiber.StatusInternalServerError, "failed to process AI requst")
	}

	return c.JSON(response)
}

// Voice2Text godoc
//
// @Summary convert voice to text
// @Tags ai
// @Accept application/octet-stream
// @Produce json
// @Success 200 {object} service.Voice2TextResponse
// @Router /ai/voice2text [post]
// @Description The API endpoint expects an audio file in audio/webm format to be provided in the request body as a blob.
func (p *AIHandler) Voice2Text(c *fiber.Ctx) error {
	// Create a temporary file to store the audio blob
	tempFile, err := os.CreateTemp("", "audio-*.webm")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create temporary file")
	}
	defer func() {
		tempFile.Close()
		os.Remove(tempFile.Name())
	}()

	// Read the audio blob from the request body and write it to the temp file
	_, err = io.Copy(tempFile, bytes.NewReader(c.Body()))
	if err != nil {
		return fiber.NewError(
			fiber.StatusInternalServerError,
			"failed to copy audio data to custom file",
		)
	}

	log.Println(tempFile.Name())

	// Call the AI service to process the audio and convert it to text
	response, err := p.aiService.Voice2Text(c.Context(), tempFile.Name())
	if err != nil {
		log.Println(err)
		return fiber.NewError(fiber.StatusInternalServerError, "failed to process AI request")
	}

	// Send the response back to the client
	return c.JSON(response)
}

type AnalysisRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// Text2voice godoc
//
// @Summary converts text to voice
// @Description Produces an audio file reading out the given text
// @Tags ai
// @Accept json
// @Router /ai/text2voice [post]
func (p *AIHandler) GetAudio(c *fiber.Ctx) error {
	QuestionRead := string(c.BodyRaw())
	audioData, err := p.aiService.Text2Voice(c.Context(), QuestionRead)
	if err != nil {
		log.Println(err)
		return fiber.NewError(fiber.StatusInternalServerError, "failed to process request")
	}
	// Send the response back to the client
	return c.JSON(audioData)
}

type CoverLetterRequest struct {
	Name       string `json:"name"`
	Education  string `json:"education"`
	Position   string `json:"position"`
	Company    string `json:"company"`
	Reasons    string `json:"reasons"`
	Experience string `json:"experience"`
}
type CoverLetterResponse struct {
	CoverLetter string `json:"coverLetter"`
}

// Cover Letter godoc
//
// @Summary creates personalised cover letter
// @Description Inputs include given name, education, position and company you are applying for, reasons to apply and previous experience
// @Tags ai
// @Accept json
// @Param CoverLetterDetails body CoverLetterRequest true "cover letter request"
// @Produce json
// @Success 200 {object} CoverLetterResponse
// @Router /ai/coverletter [post]
func (p *AIHandler) CoverLetter(c *fiber.Ctx) error {
	r := &CoverLetterRequest{}
	err := c.BodyParser(r)
	if err != nil {
		fmt.Println(err)
	}
	coverletter, err := p.aiService.GenerateCoverLetter(c.Context(), &service.CoverLetter{
		Name:       r.Name,
		Education:  r.Education,
		Position:   r.Position,
		Company:    r.Company,
		Reasons:    r.Reasons,
		Experience: r.Experience,
	})
	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(CoverLetterResponse{CoverLetter: coverletter})
}
