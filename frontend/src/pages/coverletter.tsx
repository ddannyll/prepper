import Button from "@/components/ui-kit/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { backendAPI } from "@/service/API";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  name: string
  education: string
  experience: string
  position: string
  company: string
  reasons: string
}
export default function CoverLetter() {
  const {
    register,
    handleSubmit
  } = useForm<Inputs>()

  const [coverletter, setCoverletter] = useState("AI generated cover letter")

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setCoverletter("Generating Cover Letter...")
    const cl = await backendAPI.ai.coverletterCreate(data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    )
    setCoverletter(cl.data.coverLetter || "")
  }

  return <div className="w-full h-full p-10 flex flex-col items-center relative overflow-y-scroll">
    <Dialog>
      <DialogTrigger className="text-xs text-gray-500 absolute p-2 top-0 right-0">
          Curation coming soon*
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>Coming Soon!</DialogHeader>
        <DialogDescription>
        We plan to integrate this feature with application, allowing you to make application specific cover letters!
        </DialogDescription>
      </DialogContent>
    </Dialog>
    <h1 className="text-3xl text-gray-800 px-4 py-2 mb-4 border-b-2 border-b-blue-500">Generate a Cover Letter!</h1>

    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 md:overflow-hidden">
      
      <form 
        className="flex gap-4 flex-col text-gray-800"
        onSubmit={handleSubmit(onSubmit)}>
        <FormLabel>
        Your Name
          <Input {...register("name")} defaultValue={"Charlie"}/>
        </FormLabel>
        <div className="flex gap-4 ">
          <FormLabel>
          Company Name 
            <Input {...register("company")} defaultValue={"Willy Wonka's chocolate factory"}/>
          </FormLabel>
          <FormLabel>
          Job Position
            <Input {...register("position")} defaultValue={"Factory manager"}/>
          </FormLabel>
        </div>
        <FormLabel>
        Experience
          <Textarea {...register("experience")} defaultValue={"SafetyCulture AI Accelerator"}/>
        </FormLabel>
        <FormLabel>
        Education 
          <Textarea {...register("education")} defaultValue={"Graduated from UNSW with a Bachelor's of Computer Science"}/>
        </FormLabel>
        <FormLabel>
        Reasons for Applying
          <Textarea {...register("reasons")} defaultValue={"I am passionate about software engineering and I love chocolate!"}/>
        </FormLabel>
        <Button className="justify-center" type="submit">Generate</Button>
      </form>
      
      <div className="h-full max-w-[500px] overflow-hidden flex flex-col gap-1">
        <Label>Generated Cover Letter</Label>
        <pre className="whitespace-pre-line text-gray-700 w-full h-full border bg-white rounded p-3 overflow-y-scroll">
          {coverletter}
        </pre>
      </div>
    
    </div>
  </div>
}

function FormLabel({className, children, ...props}: React.ComponentProps<typeof Label>) {
  return <Label className={cn("flex flex-col gap-1", className)} {...props}>
    {children}
  </Label>
}
