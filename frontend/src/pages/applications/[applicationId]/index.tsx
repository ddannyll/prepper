import QuestionTypeWithTags from "@/components/QuestionTypeWithTags"
import Button from "@/components/ui-kit/Button"
import { HTTPApplicatonFetcher } from "@/service/aplicationFetcher"
import { DbInnerApplication } from "@/service/swagger/Api"
import { IconArrowRight } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"

const applicationFetcer = new HTTPApplicatonFetcher()
export default function ApplicationById() {
  const router = useRouter()
  const applicationId = router.query.applicationId as string
  const {data: questionsData, isLoading: questionsLoading} = useQuery({
    queryKey: ['applicaions', applicationId],
    queryFn: () => applicationFetcer.fetchApplicationQuestions(applicationId)
  })
  const {data: appData, isLoading: appLoading} = useQuery({
    queryKey: ['applications', applicationId],
    queryFn: async () => {
      const apps = await applicationFetcer.fetchUserApplications()
      return apps.find(app => app.id === applicationId)
    }
  })

  if (appLoading || questionsLoading || appData === undefined || questionsData === undefined) {
    return <div>
      loading
    </div>
  }
  return <div className="w-full h-full p-10 flex flex-col gap-6 items-center overflow-hidden">
    <h1 className="text-center text-3xl border-b-2 py-2 px-4 border-blue-500">
      {appData.name}
    </h1>
    <ol className="grow flex flex-col w-72 gap-4 overflow-y-auto">
      {questionsData.questions?.map((q, i) => {
        return <QuestionTypeWithTags key={q.id} tags={q.tags} label={`Question ${i + 1}`}/>
      })}
    </ol>
    <Link href={`/applications/${applicationId}/interview`}>
      <Button className="flex justify-self-end items-center gap-2">
      AI Interview
        <IconArrowRight className="w-5 h-5 -mr-1"/>
      </Button>
    </Link>
  </div>
}
