import AnswerControls from "@/components/AnswerControls";
import Keyboard from "@/components/Keyboard";
import QuestionCard from "@/components/QuestionCard";
import useQuestionPlayer, { Question } from "@/hooks/useQuestionPlayer";
import { useQuestionReader } from "@/hooks/useQuestionReader";
import { MockQuestionFetcher } from "@/service/questionFetcher";
import { useEffect, useState } from "react";

const questionService = new MockQuestionFetcher();
export default function Home() {
  const [keyboardOn, setKeyboardOn] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { currQuestion, currQuestionNum, totalQuestionNum, advanceQuestion } =
    useQuestionPlayer({ questions });
  const { read, currWordIndex } = useQuestionReader({
    question: currQuestion?.questionPrompt || "",
  });

  useEffect(() => {
    const getQuestions = async () => {
      setQuestions(await questionService.getQuestions("fake interview"));
    };
    getQuestions();
  }, []);

  useEffect(() => {
    read();
  }, [currQuestion, read]);

  if (!currQuestion) {
    return <div>loading</div>;
  }

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
        <div className="max-w-lg w-full px-2 grow-0">
          <Keyboard
            className={!keyboardOn ? "opacity-0 transition" : "transition"}
          />
        </div>
        <AnswerControls
          onKeyboardClick={() => setKeyboardOn(!keyboardOn)}
          onSubmitClick={advanceQuestion}
          keyboardOn={keyboardOn}
        />
      </div>
    </div>
  );
}
