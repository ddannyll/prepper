import { useMemo, useState } from "react";

export interface Question {
  questionPrompt: string;
  tags: string[];
}

interface useQuestionPlayerArgs {
  questions: Question[];
}

// This hook controls the question playing
export default function useQuestionPlayer({
  questions,
}: useQuestionPlayerArgs) {
  console.log("hook + ", { questions });
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);

  const advanceQuestion = () => {
    if (currQuestionIndex >= questions.length - 1) {
      return false;
    }
    setCurrQuestionIndex((prev) => prev + 1);
    return true;
  };

  const currQuestion = useMemo(
    () => questions[currQuestionIndex],
    [currQuestionIndex, questions],
  );
  const currQuestionNum = currQuestionIndex + 1;
  const totalQuestionNum = questions.length;

  return {
    currQuestion,
    advanceQuestion,
    currQuestionNum,
    totalQuestionNum,
  };
}
