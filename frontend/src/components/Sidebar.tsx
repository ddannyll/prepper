import { cn } from "@/lib/utils"

interface SidebarProps {
  applications?: {
    name: string
    id: string
  }
  className?: string
}
export default function Sidebar({applications, className}: SidebarProps) {
  return <div className={cn(className)} />
}

interface NavButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}
function NavButton({className, children, ...props}: NavButtonProps) {
  return <button className={cn(className)} {...props}>
    {children}
  </button>
}
