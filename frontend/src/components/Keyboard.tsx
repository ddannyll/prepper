import { Dispatch } from "react";

interface KeyboardProps {
  className?: string;
  value: string
  setValue: Dispatch<React.SetStateAction<string>>
}

export default function Keyboard({ value, setValue, className }: KeyboardProps) {
  return (
    <textarea
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder="Your response goes here."
      className={`w-full h-32 px-6 py-4 rounded-md border-l shadow-md border-blue-300 text-lg font-bold text-gray-700 bg-white resize-none focus:outline-none ${className}`}
    />
  );
}
