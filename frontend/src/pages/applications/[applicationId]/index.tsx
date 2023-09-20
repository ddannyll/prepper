import QuestionTypeWithTags from "@/components/QuestionTypeWithTags"
import Button from "@/components/ui-kit/Button"
import { Skeleton } from "@/components/ui/skeleton"
import { HTTPApplicatonFetcher } from "@/service/aplicationFetcher"
import { IconArrowRight } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { v4 as uuid } from "uuid"

const applicationFetcer = new HTTPApplicatonFetcher()
export default function ApplicationById() {
  const router = useRouter()
  const applicationId = router.query.applicationId as string
  const {data: questionsData } = useQuery({
    queryKey: ['applicaions', applicationId],
    queryFn: () => applicationFetcer.fetchApplicationQuestions(applicationId)
  })
  const {data: appData } = useQuery({
    queryKey: ['applications', applicationId],
    queryFn: async () => {
      const apps = await applicationFetcer.fetchUserApplications()
      return apps.find(app => app.id === applicationId)
    }
  })

  return <div className="w-full h-full p-10 flex flex-col gap-6 items-center overflow-hidden">
    <h1 className="text-center text-3xl border-b-2 py-2 px-4 border-blue-500">
      {appData ? 
        appData.name : 
        <Skeleton className="text-opacity-0 bg-gray-200 w-52 h-10"/>}
    </h1>
    <ol className="grow flex flex-col w-72 gap-4 overflow-y-auto">
      {questionsData ? questionsData.questions?.map((q, i) => {
        return <QuestionTypeWithTags key={q.id} tags={q.tags} label={`Question ${i + 1}`}/>
      }) :
        [...Array(3)].map(() => <Skeleton key={uuid()} className="h-[100px] border bg-white flex flex-col">
          <Skeleton className="bg-gray-200 m-2 h-6" />
          <hr className="px-2"/>
          <div className="flex wrap gap-2 p-2 items-end grow">
            <Skeleton className="w-10 h-4 rounded-full bg-gray-200"/>
            <Skeleton className="w-16 h-4 rounded-full bg-gray-200"/>
          </div>
        </Skeleton>)
      }
    </ol>
    <Link href={`/applications/${applicationId}/interview`}>
      <Button className="flex justify-self-end items-center gap-2">
      AI Interview
        <IconArrowRight className="w-5 h-5 -mr-1"/>
      </Button>
    </Link>
  </div>
}
