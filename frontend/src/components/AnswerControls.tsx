import {
  IconArrowForward,
  IconKeyboard,
  IconMicrophone,
} from "@tabler/icons-react";

interface AnswerControlsProps {
  onSubmitClick?: () => void;
  onKeyboardClick?: () => void;
  onMicClick?: () => void;
  keyboardOn: boolean;
}
export default function AnswerControls({
  keyboardOn = false,
  onKeyboardClick,
  onSubmitClick,
  onMicClick,
}: AnswerControlsProps) {
  return (
    <div className="inline-flex w-fit items-stretch divide-x rounded overflow-hidden shadow">
      <IconButton onClick={onMicClick}>
        <IconMicrophone />
      </IconButton>
      <IconButton onClick={onKeyboardClick} active={keyboardOn}>
        <IconKeyboard />
      </IconButton>
      <IconButton onClick={onSubmitClick}>
        <IconArrowForward />
      </IconButton>
    </div>
  );
}

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}
function IconButton({
  children,
  className,
  active,
  ...props
}: IconButtonProps) {
  const activeClasses = active ? "bg-blue-50" : "";
  return (
    <button
      {...props}
      className={`${className} flex justify-center p-2 px-5 
      bg-white text-blue-500 transition
      hover:bg-blue-50  active:translate-y-0.5 active:bg-blue-100
      ${activeClasses}`}
    >
      {children}
    </button>
  );
}
