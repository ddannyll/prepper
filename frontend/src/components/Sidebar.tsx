import Image from 'next/image'
import Logo from '../assets/prepper-logo.png'
import Button from './ui-kit/Button'
import { IconPlus} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { HTTPApplicatonFetcher } from '@/service/aplicationFetcher'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

const applicationFetcher = new HTTPApplicatonFetcher()
export default function Sidebar() {
  const router = useRouter()
  const {data: applications, } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      return await applicationFetcher.fetchUserApplications()
    }
  })
  const gotoNewApplication = () => {
    router.push('/applications/new')
  }
  return <div className="h-full min-w-[225px] py-4 px-6 bg-white shadow">
    <Image
      src={Logo}
      alt="prepper logo"
      className='w-40 px-3'
    />
    { // for a future milestone
    // <ul className='flex flex-col gap-2 my-8'>
    //   <SidebarButton>
    //     <IconHome />
    //     Dashboard
    //   </SidebarButton> 
    //   <SidebarButton>
    //     <IconUser />
    //     Profile
    //   </SidebarButton> 
    // </ul>
    }
    <button 
      className='flex items-center justify-between w-full gap-2 px-4 py-2 my-6 rounded-md text-gray-500 font-medium text-xs hover:bg-gray-100'
      onClick={gotoNewApplication}
    >
      Applications
      <IconPlus className='h-3.5 w-3.5 rounded-sm '/>
    </button>
    <ul>
      {
        applications?.map(app => <SidebarButton key={app.id}>
          {app.name}
        </SidebarButton>)
      }
    </ul>
  </div>
}

interface SidebarButton extends React.ComponentProps<'button'>{
  highlighted?: boolean
}
function SidebarButton({highlighted=false, children}: SidebarButton) {
  return <li>
    <Button 
      variant='tertiary' 
      className={cn('py-1 w-full flex gap-2 text-left text-gray-500', {
        "bg-blue-100": highlighted
      })}>
      {children} 
    </Button>   
  </li>
}
