import { useRouter } from "next/router"

export default function Application() {
  const router = useRouter()
  const applicationId = router.query.applicationId
  return <div className="w-full h-full bg-gray-500">
    Application By Id {applicationId}
  </div>
}
