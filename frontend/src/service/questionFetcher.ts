import { Question } from "@/hooks/useQuestionPlayer";
import { backendAPI } from "./API";

interface QuestionFetcher {
  getQuestions: (interviewId: string) => Promise<Question[]>; // todo: replace this with neo's types
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
    try {
      // fetch from the backend
      console.log(`mocking interview: ${interviewId}`);

      const resp = await backendAPI.application.questionsCreate(
        {
          id: interviewId,
          numberQuestions: 5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const jsonString: string = resp.data.text;

      console.log(jsonString);

      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.log(jsonString);
        console.error("Failed to parse JSON:", e);
        return this.mockQuestions;
      }
    } catch (e) {
      console.log(e);
      return this.mockQuestions;
    }
  }
}
