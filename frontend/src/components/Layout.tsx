import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { Toaster } from "./ui/toaster";
import Link from "next/link";
import Button from "./ui-kit/Button";

interface LayoutProps {
  children: React.ReactNode
}
export default function Layout({children}: LayoutProps) {
  const router = useRouter()
  if (router.pathname.includes('interview')) {
    return <div className="w-screen h-screen flex flex-col bg-gray-50">
      <Link href="/applications/" className="inline w-fit text-sm px-3 py-1 text-gray-500 transition rounded-r hover:bg-gray-200 hover:text-gray-700">
        Back to dashboard
      </Link>
      <Toaster />
      {children}
    </div>
  }
  if (!router.pathname.includes('application')) {
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
