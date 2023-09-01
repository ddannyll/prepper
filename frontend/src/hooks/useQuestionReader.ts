import { useEffect, useMemo, useState } from "react";

interface useQuestionReaderArgs {
  question: string;
}
// this is just mock for now
export function useQuestionReader({ question }: useQuestionReaderArgs) {
  const questionWords = useMemo(() => question.split(" "), [question]);
  const [currWordIndex, setCurrWordIndex] = useState(-1);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    setReading(false);
    setCurrWordIndex(-1);
  }, [question]);

  const read = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setReading(true);
  };

  useEffect(() => {
    if (!reading || currWordIndex > questionWords.length - 1) {
      return;
    }
    const timeout = setTimeout(() => setCurrWordIndex((prev) => prev + 1), 100);
    return () => clearTimeout(timeout);
  }, [reading, currWordIndex, questionWords.length]);

  return {
    read,
    questionWords,
    currWordIndex,
  };
}
