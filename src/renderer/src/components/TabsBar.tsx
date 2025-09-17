import React from 'react'
import { useTabsStore } from '@/lib/tabs-store'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { SidebarTrigger } from './ui/sidebar'
import { useCreateRequest } from '@/lib/requests-store'

export const TabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useTabsStore()
  const createRequestMutation = useCreateRequest()

  const handleAddTab = async () => {
    try {
      // Create request without collection (null) for standalone tabs
      const result = await createRequestMutation.mutateAsync({
        collection_id: 1,
        name: 'Untitled',
        method: 'GET',
        url: '',
        headers: {},
        auth: { type: 'no-auth' }
      })

      // Create tab for the new request
      addTab({
        title: 'Untitled',
        type: 'request',
        content: {
          id: result.id,
          collectionId: 1,
          method: 'GET',
          url: '',
          headers: {},
          auth: { type: 'no-auth' },
          queryParams: {},
          body: { type: 'none' }
        }
      })
    } catch (error) {
      console.error('Failed to create request:', error)
    }
  }

  return (
    <div className="flex items-center bg-sidebar border-b pt-4 px-2 gap-1 flex-shrink-0">
      <SidebarTrigger className="-ml-1 mt-1" />

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center justify-between w-[130px] px-2 py-2 rounded-none cursor-pointer transition-colors  ${
            activeTabId === tab.id ? 'border-b-primary border-b-2' : ''
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="text-sm font-medium truncate max-w-32">
            {tab.title}
            {tab.isDirty && <span className="text-orange-500 ml-1">•</span>}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2" onClick={handleAddTab}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default TabsBar
