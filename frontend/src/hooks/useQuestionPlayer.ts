import { useEffect, useMemo, useState } from "react";

export interface Question {
  questionPrompt: string;
  tags: string[];
  audioLink?: string;
}
export interface QuestionAnswerPair {
  question: Question;
  answer: string;
}
interface useQuestionPlayerArgs {
  questions: Question[];
}

// This hook controls the question playing
export default function useQuestionPlayer({
  questions,
}: useQuestionPlayerArgs) {
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([
    ...Array(questions.length).fill(""),
  ]);

  const submitAnswer = (answer: string) => {
    console.log(questionAnswerPairs);
    if (finished) {
      return;
    }
    const newAnswers = [...answers];
    newAnswers[currQuestionIndex] = answer;
    setAnswers(newAnswers);
  };
  const advanceQuestion = () => {
    if (finished) {
      return;
    }
    if (currQuestionIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrQuestionIndex(currQuestionIndex + 1);
  };

  const submitAndAdvance = (answer: string) => {
    if (finished) {
      return;
    }
    submitAnswer(answer);
    advanceQuestion();
  };

  const currQuestion =
    questions.length > 0 ? questions[currQuestionIndex] : null;
  const currAnswer = answers.length > 0 ? answers[currQuestionIndex] : null;
  const currQuestionNum = currQuestionIndex + 1;
  const totalQuestionNum = questions.length;
  const questionAnswerPairs = useMemo(
    () =>
      questions.map((q, i) => ({
        question: q,
        answer: answers[i],
      })),
    [questions, answers]
  );

  return {
    currQuestion,
    currAnswer,
    questionAnswerPairs,
    submitAnswer,
    finished,
    submitAndAdvance,
    advanceQuestion,
    currQuestionNum,
    totalQuestionNum,
  };
}
