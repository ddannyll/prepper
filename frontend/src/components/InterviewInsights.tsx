import { v4 as uuid } from 'uuid';
import { useEffect, useMemo, useState } from "react";
import { QuestionCardMainSection, QuestionNumber } from "./QuestionCard";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  IconThumbUp,
  IconWand,
} from "@tabler/icons-react";
import IconButton from './ui-kit/IconButton';
import { HTTPInsightFetcher, MockInsightFetcher } from "@/service/insightFetcher";
import { QuestionAnswerPair } from '@/hooks/useQuestionPlayer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';

// const insightFetcher = new MockInsightFetcher()
const insightFetcher = new HTTPInsightFetcher()

interface InterviewInsightsProps {
  questionAnswerPairs: QuestionAnswerPair[] 
}
export interface Insight {
  type: "good" | "bad"
  insight: string
}
export default function InterviewInsights({
  questionAnswerPairs,
}: InterviewInsightsProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const {isLoading: insightsLoading, data: insights, isError} = useQuery(
    {
      queryKey: [
        "insights",
        questionAnswerPairs
      ], 
      queryFn: async ({queryKey}) => {
        const qaPairs = queryKey[1] as QuestionAnswerPair[]
        const insights = await Promise.all(
          qaPairs.map(qa => insightFetcher.getQAInsight(qa.question.questionPrompt, qa.answer))
        ) 
        return insights
      },
      refetchOnWindowFocus: false
    },
  )

  const question = useMemo(() => {
    if (!questionAnswerPairs || questionAnswerPairs.length == 0) {
      return null;
    }
    return questionAnswerPairs[questionIndex].question;
  }, [questionAnswerPairs, questionIndex]);
  const answer = useMemo(() => {
    if (!questionAnswerPairs || questionAnswerPairs.length == 0) {
      return null;
    }
    return questionAnswerPairs[questionIndex].answer;
  }, [questionAnswerPairs, questionIndex]);

  if (question == null) {
    return <div>loading</div>;
  }

  const nextInsight = () => {
    if (questionIndex >= questionAnswerPairs.length - 1) {
      return
    }
    setQuestionIndex(questionIndex + 1)
  }
  const prevInsight = () => {
    if (questionIndex <= 0) {
      return 
    }
    setQuestionIndex(questionIndex - 1)
  }

  return (
    <div className="flex flex-col items-center overflow-hidden justify-between p-8 h-full">
      <div className="flex gap-8 w-full pb-4 overflow-hidden items-start justify-center">
        <div className="max-w-lg w-full h-fit grow overflow-hidden p-6 shadow-md bg-white rounded-lg flex flex-col gap-3">
          <div className="flex gap-2 items-end">
            <QuestionNumber
              questionNum={questionIndex + 1}
              totalQuestionNum={questionAnswerPairs.length}
            />
          </div>
          <hr className="-mx-6 border-y-2 border-indigo-500" />
          <QuestionCardMainSection
            tags={question.tags}
            prompt={question.questionPrompt.split(" ")}
          />
          <div className="mt-8 border-l overflow-y-auto border-indigo-500 px-4 py-1 shadow bg-gray-50 rounded">
            <h2 className="text-lg font-bold text-gray-800">Your response</h2>
            <p className="text-gray-800">{answer}</p>
          </div>
        </div>

        <div className="flex flex-col grow items-stretch gap-4 overflow-hidden h-fit shadow-md rounded-lg bg-white p-6 w-full max-w-lg">
          <h1 className="flex gap-2 text-3xl font-bold">
            Insights
            <IconWand className="h-9 w-9" />
          </h1>
          <hr className="-mx-6 border-y-2 border-indigo-500" />
          <div className="grid grid-cols-1 gap-2">
            {
              insightsLoading && <div className='grid grid-cols-[40px_1fr] gap-2'>
                <Skeleton className="w-full aspect-square bg-gray-200"/>
                <Skeleton className="h-20 bg-gray-200"/>
                <Skeleton className="w-full aspect-square bg-gray-200"/>
                <Skeleton className="h-full bg-gray-200"/>
              </div>
            }
            {!insightsLoading && insights && insights[questionIndex].map(ins => 
              <InsightComponent type={ins.type} key={uuid()}>
                {ins.insight}
              </InsightComponent>
            )}
            {isError && <div>error</div>}
          </div>
        </div>
      </div>

      <div className="flex divide-x shadow">
        <IconButton onClick={prevInsight}>
          <IconArrowLeft />
        </IconButton>
        <IconButton>
          <IconInfoCircle />
        </IconButton>
        <IconButton onClick={nextInsight}>
          <IconArrowRight/>
        </IconButton>
      </div>
    </div>
  );
}

interface InsightComponentProps {
  type: "good" | "bad";
  children?: React.ReactNode;
}
function InsightComponent({ type, children }: InsightComponentProps) {
  const iconClasses = "w-6 h-6";
  const bgClasses = type === "good" ? "bg-green-200" : "bg-red-200";
  const icon =
    type === "good" ? (
      <IconThumbUp className={`text-green-900 ${iconClasses}`} />
    ) : (
      <IconAlertTriangle className={`text-red-900 ${iconClasses}`} />
    );
  return (
    <div className="flex rounded-md w-full overflow-hidden items-start shadow">
      <div className={`shrink-0 p-2 w-fit h-full ${bgClasses}`}>{icon}</div>
      <div className="p-2 text-gray-800 bg-gray-50 h-full w-full">{children}</div>
    </div>
  );
}
