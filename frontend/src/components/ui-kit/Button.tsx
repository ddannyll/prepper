interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger"
  size?: "sm" | "md" | "lg"
}
export default function Button({children, size="md", className, variant="primary"}: IconButtonProps) {
  const buttonClasses = "rounded-md transition"
  const sizeClasses =  {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }
  const variantClasses = {
    primary: "bg-blue-500 text-blue-50 hover:bg-blue-400",
    secondary: "bg-blue-50 border-blue-100 border hover:bg-blue-100 active:bg-blue-200 text-blue-600",
    tertiary: "text-blue-600 hover:bg-blue-100",
    danger: "bg-red-500 text-red-50 hover:bg-red-400",
  }
  return <button className={`${buttonClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
    {children}
  </button>
}
