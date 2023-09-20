import {
  IconArrowForward,
  IconCircleFilled,
  IconKeyboard,
  IconMicrophone,
} from "@tabler/icons-react";
import IconButton from "./ui-kit/IconButton";
interface AnswerControlsProps {
  onSubmitClick?: () => void;
  onKeyboardClick?: () => void;
  onMicClick?: () => void;
  keyboardOn: boolean;
  micOn?: boolean
}
export default function AnswerControls({
  keyboardOn = false,
  onKeyboardClick,
  onSubmitClick,
  onMicClick,
  micOn = false
}: AnswerControlsProps) {
  return (
    <div className="inline-flex w-fit items-stretch divide-x rounded overflow-hidden shadow">
      <IconButton onClick={onMicClick} className="relative" active={micOn}>
        {status}
        <IconMicrophone />
        {micOn && <IconCircleFilled className="absolute w-4 h-4 text-red-400 animate-pulse translate-x-4 -translate-y-1" />}
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
