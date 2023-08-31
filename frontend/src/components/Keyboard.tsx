interface KeyboardProps {
  className?: string;
}

export default function Keyboard({ className }: KeyboardProps) {
  return (
    <textarea
      placeholder="Your response goes here."
      className={`w-full h-32 px-6 py-4 rounded-md border-l shadow-md border-blue-300 text-lg font-bold text-gray-700 bg-white resize-none focus:outline-none ${className}`}
    />
  );
}
