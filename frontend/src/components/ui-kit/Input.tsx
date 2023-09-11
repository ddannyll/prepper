import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "outline" | "darkened"
  label?: React.ReactNode
  id?: string
  error?: string[]
  className?:string
}
export default function Input({variant="outline", id, error=[], label, className, ...props}: InputProps) {
  const variantClasses = {
    outline: "border border-2",
    darkened: "bg-gray-50 border"
  } 
  return <div className="flex flex-col text-gray-800">
    {label && 
    <label htmlFor={id} >
      {label}
    </label>
    }
    <input id={id} className={cn(`rounded-md px-4 py-2 focus:outline-gray-500`, variantClasses[variant], className)} {...props}/>
  </div>}

  
