import AnswerControls from "@/components/AnswerControls";
import InterviewInsights from "@/components/InterviewInsights";
import Keyboard from "@/components/Keyboard";
import QuestionCard from "@/components/QuestionCard";
import useQuestionPlayer, { Question } from "@/hooks/useQuestionPlayer";
import { useQuestionReader } from "@/hooks/useQuestionReader";
import {
  HTTPQuestionFetcher,
  MockQuestionFetcher,
} from "@/service/questionFetcher";
import { BASE_URL } from "@/service/API";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { useReactMediaRecorder } from "react-media-recorder";
import BeatLoader from "react-spinners/BeatLoader";

const questionService = new HTTPQuestionFetcher();

import React, { useState, useEffect } from "react";

function AudioPlayerUnMemo({ base64Data }: { base64Data?: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = React.createRef<HTMLAudioElement>();

  useEffect(() => {
    if (base64Data) {
      // Decode the Base64 data to get the MP3 Blob
      const mp3Blob = new Blob(
        [
          new Uint8Array(
            atob(base64Data)
              .split("")
              .map(function (c) {
                return c.charCodeAt(0);
              })
          ),
        ],
        { type: "audio/mp3" }
      );

      // Create an Object URL from the Blob
      const url = URL.createObjectURL(mp3Blob);
      setAudioUrl(url);
      // Cleanup: Revoke the Object URL when the component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [base64Data]);

  useEffect(() => {
    // Auto play the audio
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, [audioRef]);

  if (!audioUrl) {
    return null;
  }

  return (
    <audio controls src={audioUrl} ref={audioRef} className="mx-auto hidden">
      Your browser does not support the audio element.
    </audio>
  );
}

const AudioPlayer = React.memo(AudioPlayerUnMemo);

const InterviewPage = () => {
  const router = useRouter();

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      askPermissionOnMount: true,
    });
  const [keyboardOn, setKeyboardOn] = useState(false);
  const applicationId = router.query.applicationId as string;
  const [keyboardVal, setKeyboardVal] = useState("");

  const {
    data: questions,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["interview", applicationId],
    queryFn: async () => {
      return await questionService.getQuestions(applicationId);
    },
    refetchOnWindowFocus: false,
    cacheTime: 0,
  });
  const {
    finished,
    currQuestion,
    currQuestionNum,
    totalQuestionNum,
    questionAnswerPairs,
    advanceQuestion,
    submitAndAdvance,
  } = useQuestionPlayer({ questions: questions || [] });

  const { read, currWordIndex } = useQuestionReader({
    question: currQuestion?.questionPrompt || "",
  });
  useEffect(() => {
    read();

    //
  }, [currQuestion, read]);

  useEffect(() => {
    if (!mediaBlobUrl) {
      return;
    }
    (async () => {
      setKeyboardOn(true);
      setKeyboardVal("Processing audio...");
      const audioFile = await fetch(mediaBlobUrl);
      const audioBlob = await audioFile.blob();

      const response = await fetch(`${BASE_URL}/ai/voice2text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: audioBlob,
      });
      if (!response.ok) {
        console.error("failed to voice2text");
      }
      const data = await response.json();
      setKeyboardVal(data.text);
    })();
  }, [mediaBlobUrl]);

  if (isLoading || isFetching || !currQuestion) {
    return (
      <div className="w-full h-full flex flex-col gap-4 justify-center items-center mb-14 text-blue-500">
        <span className="text-xl font-light uppercase">
          Generating Questions...
        </span>
        <BeatLoader color="#3c81f6" />
      </div>
    );
  }

  console.log(questions);
  if (questions?.length === 0) {
    return <div>error</div>;
  }

  if (!finished) {
    return (
      <div className="bg-gray-50 h-screen flex flex-col justify-between py-8">
        <AudioPlayer base64Data={currQuestion.audioLink} />
        <QuestionCard
          skipQuestion={() => {
            advanceQuestion();
            setKeyboardVal("");
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
                startRecording();
                setKeyboardOn(false);
              } else {
                stopRecording();
              }
            }}
            onKeyboardClick={() => setKeyboardOn(!keyboardOn)}
            onSubmitClick={() => {
              submitAndAdvance(keyboardVal);
              setKeyboardVal("");
            }}
            keyboardOn={keyboardOn}
            micOn={status === "recording"}
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
