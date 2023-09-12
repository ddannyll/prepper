import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { Toaster } from "./ui/toaster";

interface LayoutProps {
  children: React.ReactNode
}
export default function Layout({children}: LayoutProps) {
  const router = useRouter()
  if (!router.pathname.includes('application') || router.pathname.includes('interview')) {
    return <div className="w-screen h-screen">
      <Toaster />
      {children}
    </div>
  }
  //Dashboard
  return <div className="w-screen h-screen flex bg-gray-50">
    <Toaster />
    <Sidebar />
    {children} 
  </div>
}
