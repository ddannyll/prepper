import { Insight } from "@/components/InterviewInsights";

interface InsightFetcher {
  getQAInsight: (question: string, answer: string) => Promise<Insight>
}

export class MockInsightFetcher implements InsightFetcher {
  async getQAInsight(question: string, answer: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const insight: Insight = {
      type: "good",
      insight: "dummy insight"
    }
    console.log("mock fetching insight", question, answer)
    return insight
  }
}


