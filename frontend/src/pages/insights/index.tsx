import InterviewInsights from "@/components/InterviewInsights";

export default function InsightsPage() {
  return <div className="h-screen bg-gray-50">
    <InterviewInsights 
      questionAnswerPairs={[
        {
          question: {
            questionPrompt: "Tell me about yourself?",
            tags: ["background"]
          },
          answer: "My name is Daniel Nguyen and I am a Computer Science Student"
        }
      ]}
    />
  </div>
}
