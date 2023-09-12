import AnswerControls from "@/components/AnswerControls";
import InterviewInsights from "@/components/InterviewInsights";
import Keyboard from "@/components/Keyboard";
import QuestionCard from "@/components/QuestionCard";
import useQuestionPlayer, { Question } from "@/hooks/useQuestionPlayer";
import { useQuestionReader } from "@/hooks/useQuestionReader";
import { HTTPQuestionFetcher, MockQuestionFetcher } from "@/service/questionFetcher";
import { BASE_URL } from "@/service/API";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import BeatLoader from "react-spinners/BeatLoader";

const questionService = new HTTPQuestionFetcher();

const InterviewPage = () => {
  const router = useRouter();

  const {status, startRecording, stopRecording, mediaBlobUrl} =  useReactMediaRecorder({
    audio: true,
    askPermissionOnMount: true
  })  
  const [keyboardOn, setKeyboardOn] = useState(false);
  const applicationId = router.query.applicationId as string
  const [keyboardVal, setKeyboardVal] = useState("");
  const [audioLoading, setAudioLoading] = useState(false)
  const { data:questions, isLoading, isFetching } = useQuery({
    queryKey: ['interview', applicationId],
    queryFn: async () => {
      return await questionService.getQuestions(applicationId)
    },
    refetchOnWindowFocus: false,
    cacheTime: 0
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

  useEffect(() => {
    if (!mediaBlobUrl) {
      return
    }
    (async () => {
      setKeyboardOn(true)
      setKeyboardVal('Processing audio...')
      const audioFile = await fetch(mediaBlobUrl)
      const audioBlob = await audioFile.blob()
      
      const response = await fetch(`${BASE_URL}/ai/voice2text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      })
      if (!response.ok) {
        console.error("failed to voice2text")
      }
      const data = await response.json()
      setKeyboardVal(data.text)
    })()
  }, [mediaBlobUrl])

  
  if (isLoading || isFetching || !currQuestion) {
    return <div className="w-full h-full flex flex-col gap-4 justify-center items-center mb-14 text-blue-500">
      <span className="text-xl font-light uppercase">Generating Questions...</span>
      <BeatLoader color="#3c81f6"/>
    </div>
  }
  if (questions?.length === 0) {
    return <div>error</div>
  }


  if (!finished) {
    return (
      <div className="bg-gray-50 h-screen flex flex-col justify-between py-8">
        <QuestionCard
          skipQuestion={() => {
            advanceQuestion()
            setKeyboardVal("")
          }}
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
          </div>
          <AnswerControls
            onMicClick={() => {
              if (status != "recording") {
                startRecording()
                setKeyboardOn(false)
              } else {
                stopRecording()
              }
            }}
            onKeyboardClick={() => setKeyboardOn(!keyboardOn)}
            onSubmitClick={() => {
              submitAndAdvance(keyboardVal);
              setKeyboardVal("");
            }}
            keyboardOn={keyboardOn}
            micOn={status === 'recording'}
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
