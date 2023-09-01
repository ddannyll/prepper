export interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}
export default function Badge({ children, className }: BadgeProps) {
  const hashKey = JSON.stringify({ child: children })
    .split("").reduce((prev, curr) => prev + curr.charCodeAt(0), 0);
  const colorHue = hashKey % 255;
  const bgColor = `hsl(${colorHue}, 100%, 93%)`;
  const textColor = `hsl(${colorHue}, 100%, 30%)`;
  return (
    <span
      style={{
        color: textColor,
        backgroundColor: bgColor
      }}
      className={`rounded-full py-0.5 px-2.5 text-xs tracking-wide font-semibold uppercase ${className}`}
    >
      {children}
    </span>
  );
}

