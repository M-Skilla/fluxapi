import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from 'react-router'
import TabsBar from '../TabsBar'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import RequestTab from '../RequestTab'
import { useTabsStore } from '@/lib/tabs-store'

export default function Sidebar() {
  const { tabs, activeTabId } = useTabsStore()

  return (
    <SidebarProvider className="text-neutral-500">
      <AppSidebar className="border-r border-r-neutral-700" />
      <SidebarInset>
        <TabsBar />
        <div className="flex-1 min-h-0">
          {tabs.length > 0 ? (
            <Tabs value={activeTabId ?? undefined} className="h-full">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                  {tab.type === 'request' ? (
                    <RequestTab content={tab.content} />
                  ) : (
                    <div className="p-4 text-muted-foreground">
                      Unsupported tab type: {tab.type}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex-col p-4 h-full">
              <Outlet />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
