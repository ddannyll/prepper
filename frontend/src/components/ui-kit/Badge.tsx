import { cn } from "@/lib/utils";

export interface BadgeProps {
  className?: string
  children: React.ReactNode
  disableAutoColor?: boolean
  rightIcon?: React.ReactNode
}
export default function Badge({ rightIcon, disableAutoColor=false, children, className }: BadgeProps) {
  const hashKey = JSON.stringify({ child: children?.toString().toLowerCase() })
    .split("").reduce((prev, curr, i) => prev + curr.charCodeAt(0) * (i * 2), 0);
  const colorHue = hashKey % 255
  const bgColor = `hsl(${colorHue}, 100%, 93%)`;
  const textColor = `hsl(${colorHue}, 100%, 30%)`;
  return (
    <span
      style={!disableAutoColor ? {
        color: textColor,
        backgroundColor: bgColor
      } : {}}
      className={cn(`rounded-full py-0.5 px-2.5 text-xs tracking-wide font-semibold uppercase flex gap-1`, className)}
    >
      {children}
      {rightIcon}
    </span>
  );
}

