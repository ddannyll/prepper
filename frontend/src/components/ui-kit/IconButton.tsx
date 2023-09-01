interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  active?: boolean;
}

/**
 * Expects children to be a tabler icon (or any svg icon) 
 */
export default function IconButton({
  children,
  className,
  active,
  ...props
}: IconButtonProps) {
  const activeClasses = active ? "bg-blue-50" : "bg-white";
  return (
    <button
      {...props}
      className={` flex justify-center p-2 px-5 
      text-blue-500 transition
      hover:bg-blue-50  active:translate-y-0.5 active:bg-blue-100
      ${className}
      ${activeClasses}`}
    >
      {children}
    </button>
  );
}
