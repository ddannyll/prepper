import Image from "next/image";
import Logo from "../assets/prepper-logo.png";
import Button from "./ui-kit/Button";
import {
  IconFilePencil,
  IconMenu2,
  IconPlus,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { HTTPApplicatonFetcher } from "@/service/applicationFetcher";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
const applicationFetcher = new HTTPApplicatonFetcher();
export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      return await applicationFetcher.fetchUserApplications();
    },
  });
  const gotoNewApplication = () => {
    setSidebarOpen(false);
    router.push("/applications/new");
  };
  return (
    <div>
      <button
        className="absolute z-20 md:hidden left-5 top-5"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <IconMenu2
          className={cn("w-7 h-7 text-blue-500", {
            hidden: sidebarOpen,
          })}
        />
        <IconX
          className={cn("w-7 h-7 text-red-500", {
            hidden: !sidebarOpen,
          })}
        />
      </button>
      <div
        className={cn(
          "z-10 absolute w-screen md:w-[224px] md:relative md:flex flex-col shrink-0 h-full  py-4 px-6 bg-white shadow ",
          {
            hidden: !sidebarOpen,
            "pt-20": sidebarOpen,
          }
        )}
      >
        <Link href={"/applications"}>
          <Image src={Logo} alt="prepper logo" className="w-40 px-3" />
        </Link>
        <ul className="flex flex-col gap-2 mt-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="ml-1" variant="subtle" size="sm">
                <IconUser />
                Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="text-gray-500">
              Profile functionality is not yet complete!
            </DialogContent>
          </Dialog>
          <SidebarButton
            href="/coverletter"
            onClick={() => setSidebarOpen(false)}
          >
            <IconFilePencil />
            Cover Letter
          </SidebarButton>
        </ul>

        <button
          className="flex items-center justify-between w-full gap-2 px-4 py-2 mt-6 rounded-md text-gray-600 font-medium text-xs hover:bg-gray-100"
          onClick={gotoNewApplication}
        >
          Applications
          <IconPlus className="h-3.5 w-3.5 rounded-sm " />
        </button>
        <hr className="my-1 mx-2" />
        <ul className="gap-1 flex flex-col overflow-y-auto">
          {applications?.map((app) => (
            <SidebarButton
              onClick={() => setSidebarOpen(false)}
              highlighted={
                app.id !== undefined &&
                router.query.applicationId?.includes(app.id)
              }
              key={app.id}
              href={`/applications/${app.id}`}
            >
              {app.name}
            </SidebarButton>
          ))}
        </ul>
        <div className="grow text-sm text-gray-400 flex flex-col justify-end">
          <hr className="my-2" />
          <Link
            href="/login"
            className="flex gap-2 items-center rounded transition hover:bg-gray-100 hover:text-gray-600 p-2 px-4"
          >
            <LogOutIcon className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SidebarButton extends React.ComponentProps<"button"> {
  highlighted?: boolean;
  href: string;
}
function SidebarButton({
  highlighted = false,
  children,
  href,
  ...props
}: SidebarButton) {
  return (
    <li>
      <Link href={href || ""}>
        <Button
          variant="subtle"
          className={cn(
            "py-1 w-full flex gap-2 items-center text-left text-gray-400 text-sm",
            {
              "bg-blue-100": highlighted,
              "text-blue-600": highlighted,
            }
          )}
          {...props}
        >
          {children}
        </Button>
      </Link>
    </li>
  );
}
