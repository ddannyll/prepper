import { Textarea } from "@/components/ui/textarea"
import { SubmitHandler, useForm } from "react-hook-form"
import Button from "@/components/ui-kit/Button"
import QuestionTypeWithTags from "@/components/QuestionTypeWithTags"
import { useState } from "react"
import { v4 as uuid } from "uuid"
interface FormValues {
  jobName: string
  jobDescription: string
}
export default function NewApplication() {
  const [questions, setQuestions] = useState<{tags: string[]}[]>([{tags:[]}])
  const newQuestion = () => {
    setQuestions([...questions, {tags:[]}])
  }
  const deleteQuestion = (i: number) => {
    setQuestions(questions.slice(0, i).concat(questions.slice(i + 1)))
  }
  const setQuestionTags = (i:number, tags: string[]) => {
    const newQuestions = [...questions]
    newQuestions[i] = {...newQuestions[i], tags}
    setQuestions(newQuestions)
  }
  const onSubmit:SubmitHandler<FormValues> = (data) => {
    console.log(data)
    console.log(questions)
    // TODO: replace with backend call 
  }

  const {register, handleSubmit} = useForm<FormValues>()
  return <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full flex flex-col gap-5 items-center p-10">
    <input 
      className="text-3xl w-fit border-b-2 py-2 px-4 border-blue-500 bg-inherit outline-none"
      placeholder={"Company Name"}
      {...register("jobName")}
    />
    <div className="w-full h-full grid grid-cols-2 gap-5 overflow-hidden">
      <div className="flex flex-col gap-3">
        <Label>Job Description</Label>
        <Textarea 
          className="h-full box-border resize-none outline-white focus-visible:ring-0"
          placeholder="Copy and paste a job description here" id="job-description" 
          {...register("jobDescription")}
        />
      </div>
      <div className="flex flex-col gap-3 overflow-hidden">
        <Label className="w-full">Interview Format</Label>
        <div className="overflow-y-auto flex flex-col gap-3">
          {questions.map((q, i) => <QuestionTypeWithTags key={uuid()} deleteQuestion={() => deleteQuestion(i)} setTags={(tags: string[]) => setQuestionTags(i, tags)} tags={q.tags} label={`Question ${i + 1}`} />)}
        </div>
        <Button type="button" variant="tertiary" className="text-sm" onClick={newQuestion}>+ New Question</Button>
      </div>
    </div>
    <Button className="self-end" type="submit">Create Application</Button>
  </form>
}  

interface LabelProps extends React.ComponentProps<'label'> {} 
function Label({children}: LabelProps) {
  return <label className="self-start text-gray-600 font-bold text-xl">{children}</label>
}
