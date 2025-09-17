import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from 'react-router'
import TabsBar from '../TabsBar'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import RequestTab from '../RequestTab'
import { useTabsStore } from '@/lib/tabs-store'
import React from 'react'

export default function Sidebar() {
  const { tabs, activeTabId, validateTabs } = useTabsStore()
  const [isValidating, setIsValidating] = React.useState(false)

  // Validate tabs on mount and when tabs change
  React.useEffect(() => {
    if (tabs.length > 0) {
      setIsValidating(true)
      validateTabs().finally(() => setIsValidating(false))
    }
  }, [tabs.length, validateTabs])

  return (
    <SidebarProvider className="text-neutral-500 h-full">
      <AppSidebar className="border-r border-r-neutral-700" />
      <SidebarInset className="flex flex-col h-full">
        <TabsBar />
        <div className="flex-1 min-h-0">
          {isValidating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-muted-foreground">Validating tabs...</div>
            </div>
          ) : tabs.length > 0 ? (
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
