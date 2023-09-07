import { useRouter } from "next/router";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode
}
export default function Layout({children}: LayoutProps) {
  const router = useRouter()
  if (router.pathname.includes('play')) {
    return <div className="w-screen h-screen">
      {children}
    </div>
  }
  //Dashboard
  return <div className="w-screen h-screen flex">
    <Sidebar />
    {children} 
  </div>
}
