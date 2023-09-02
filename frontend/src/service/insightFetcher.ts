import { Insight } from "@/components/InterviewInsights";
import { backendAPI } from "./API";

interface InsightFetcher {
  getQAInsight: (question: string, answer: string) => Promise<Insight[]>
}

export class MockInsightFetcher implements InsightFetcher {
  async getQAInsight(question: string, answer: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const insight: Insight = {
      type: "good",
      insight: "dummy insight"
    }
    console.log("mock fetching insight", question, answer)
    return [insight]
  }
}


export class HTTPInsightFetcher implements InsightFetcher {
  async getQAInsight(question:string, answer: string) {
    const resp = await backendAPI.ai.analyseCreate({question, answer}) 
    if (!resp.ok) {
      throw new Error("failed to fetch")
    }
    const formatted: Insight[] = []
    resp.data?.good?.forEach(goodInsight => formatted.push({type:"good", insight: goodInsight}))
    resp.data?.bad?.forEach(badInsight => formatted.push({type:"bad", insight: badInsight}))
    return formatted
  }
}
