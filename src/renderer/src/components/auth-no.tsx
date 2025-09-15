import { Ban } from 'lucide-react'

const NoAuth = () => {
  return (
    <div className='flex flex-col gap-2 h-full items-center justify-center'>
        <Ban size={80} />
        <span className='font-medium text-xl'>No Auth</span>
    </div>
  )
}

export default NoAuth