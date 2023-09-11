import AnswerControls from "@/components/AnswerControls";
import AudioRecorder from "@/components/AudioControl";
import InterviewInsights from "@/components/InterviewInsights";
import Keyboard from "@/components/Keyboard";
import QuestionCard from "@/components/QuestionCard";
import useQuestionPlayer, { Question } from "@/hooks/useQuestionPlayer";
import { useQuestionReader } from "@/hooks/useQuestionReader";
import { MockQuestionFetcher } from "@/service/questionFetcher";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const questionService = new MockQuestionFetcher();

const InterviewPage = () => {
  const router = useRouter();

  const [keyboardOn, setKeyboardOn] = useState(false);

  const applicationId = router.query.applicationId as string
  const { data:questions, isLoading } = useQuery({
    queryKey: ['interview', applicationId],
    queryFn: () => {
      return questionService.getQuestions(applicationId)
    },
    refetchOnWindowFocus: false
  })

  const {
    finished,
    currQuestion,
    currQuestionNum,
    totalQuestionNum,
    questionAnswerPairs,
    advanceQuestion,
    submitAndAdvance,
  } = useQuestionPlayer({ questions: questions || []});
  const { read, currWordIndex } = useQuestionReader({
    question: currQuestion?.questionPrompt || "",
  });
  useEffect(() => {
    read()
  }, [currQuestion, read])
  const [keyboardVal, setKeyboardVal] = useState("");
  const [micOn, setMicOn] = useState(false);
  
  if (isLoading) {
    return <div>loading</div>
  }
  if (questions?.length === 0) {
    return <div>error</div>
  }


  if (!finished) {
    return (
      <div className="bg-gray-50 h-screen flex flex-col justify-between py-8">
        <QuestionCard
          className="mx-auto"
          totalQuestionNum={totalQuestionNum}
          prompt={currQuestion.questionPrompt.split(" ")}
          promptReadIndex={currWordIndex}
          tags={currQuestion.tags}
          questionNum={currQuestionNum}
        />
        <div className="flex flex-col items-center justify-end gap-8">
          <div className="max-w-lg w-full px-6 grow-0">
            <Keyboard
              value={keyboardVal}
              setValue={setKeyboardVal}
              className={!keyboardOn ? "opacity-0 transition" : "transition"}
            />
            {micOn && (
              <AudioRecorder
                setText={(tex: string) => {
                  setKeyboardOn(true);
                  setKeyboardVal(tex);
                }}
              />
            )}
          </div>
          <AnswerControls
            onMicClick={() => {
              setMicOn(!micOn);
              // record and store audio
            }}
            onKeyboardClick={() => setKeyboardOn(!keyboardOn)}
            onSubmitClick={() => {
              submitAndAdvance(keyboardVal);
              setKeyboardVal("");
            }}
            keyboardOn={keyboardOn}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <InterviewInsights questionAnswerPairs={questionAnswerPairs} />
    </div>
  );
};

export default InterviewPage;
