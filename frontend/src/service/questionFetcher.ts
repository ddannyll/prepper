import { Question } from "@/hooks/useQuestionPlayer";

interface QuestionFetcher {
  getQuestions: (interviewId: string) => Promise<Question>[]; // todo: replace this with neo's types
}

export class MockQuestionFetcher implements QuestionFetcher {
  mockQuestions: Question[] = [
    {
      questionPrompt: "Tell me about yourself.",
      tags: ["background", "common"],
    },
    {
      questionPrompt: "Where do you see youself in 5 years?",
      tags: ["career", "behavioural"],
    },
    {
      questionPrompt:
        "Tell me about a time where you had to manage conflict between teammates. What did you do to manage this conflict.",
      tags: ["behavioural", "situation"],
    },
    {
      questionPrompt: "Why do you think you are a good fit for this role.",
      tags: ["behvaioural"],
    },
    {
      questionPrompt: "How do you manage your time?",
      tags: ["behavioural"],
    },
  ];

  async getQuestions(interviewId: string) {
    console.log(`mocking interview: ${interviewId}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return this.mockQuestions;
  }
}
