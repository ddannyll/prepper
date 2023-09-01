import {
  IconArrowForward,
  IconKeyboard,
  IconMicrophone,
} from "@tabler/icons-react";
import IconButton from "./IconButton";

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
