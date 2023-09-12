import Button from "@/components/ui-kit/Button";
import { IconPencilPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function ApplicationHome() {
  return <div className="w-full h-full flex gap-8 justify-center items-center">
    <div className="flex flex-col gap-4 items-center">
      <h1 className="text-3xl text-gray-600">Welcome To Prepper!</h1>
      <p className="text-gray-500">Create a new application to get started!</p>
      <Link href="/applications/new" >
        <Button className="flex gap-2 items-center">
          <IconPencilPlus className=""/>
          New Application</Button>
      </Link>
    </div>
  </div>
}
