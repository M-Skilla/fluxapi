import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from 'react-router'
import TabsBar from '../TabsBar'

export default function Sidebar() {
  return (
    <SidebarProvider className='text-neutral-500'>
      <AppSidebar className="border-r border-r-neutral-700" />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 mt-5" />
          <TabsBar />
        </header>
        <div className="flex-col p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
