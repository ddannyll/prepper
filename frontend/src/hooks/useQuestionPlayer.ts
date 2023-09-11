import { useEffect, useMemo, useState } from "react";

export interface Question {
  questionPrompt: string;
  tags: string[];
}
export interface QuestionAnswerPair {
  question: Question
  answer: string
}
interface useQuestionPlayerArgs {
  questions: Question[];
}

// This hook controls the question playing
export default function useQuestionPlayer({
  questions,
}: useQuestionPlayerArgs) {
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [questionAnswerPairs, setQuestionAnswersPairs] = useState<QuestionAnswerPair[]>([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setQuestionAnswersPairs(questions.map(q => ({question: q, answer: ""})))
  }, [questions])

  const submitAnswer = (answer: string) => {
    console.log(questionAnswerPairs)
    if (finished) {
      return
    }
    const newQAPairs = [...questionAnswerPairs]
    const newQAPair = {
      ...newQAPairs[currQuestionIndex],
      answer
    }
    newQAPairs[currQuestionIndex] = newQAPair 
    setQuestionAnswersPairs(newQAPairs)
  }
  const advanceQuestion = () => {
    if (finished) {
      return
    }
    if (currQuestionIndex + 1 >= questions.length) {
      setFinished(true)
      return
    }
    setCurrQuestionIndex(currQuestionIndex + 1);
  };
  
  const submitAndAdvance = (answer: string) => {
    if (finished) {
      return
    }
    submitAnswer(answer)
    advanceQuestion()
  } 

  const currQuestion = questions.length > 0 ? questions[currQuestionIndex] : null
  const currAnswer = questions.length > 0 ? questionAnswerPairs[currQuestionIndex]?.answer : null
  const currQuestionNum = currQuestionIndex + 1;
  const totalQuestionNum = questions.length;

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
