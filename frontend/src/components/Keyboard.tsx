interface KeyboardProps {
  className?: string;
}

export default function Keyboard({ className }: KeyboardProps) {
  return (
    <div className={`${className} p-8 bg-white shadow-md rounded-md w-full`}>
      <h1 className="text-sm">Response</h1>
      <textarea
        placeholder="Your response goes here."
        className="w-full h-32 text-lg font-bold text-gray-700 resize-none focus:outline-none"
      />
    </div>
  );
}
