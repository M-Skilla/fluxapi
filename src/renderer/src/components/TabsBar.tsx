import React from 'react'
import { useTabsStore } from '@/lib/tabs-store'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

export const TabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useTabsStore()

  const handleAddTab = () => {
    addTab({
      title: 'New Request',
      type: 'request',
      content: {
        method: 'GET',
        url: '',
        headers: {},
        queryParams: {}
      }
    })
  }

  return (
    <div className="flex items-center bg-background border-b px-2 py-1 gap-1">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-t-md border cursor-pointer transition-colors ${
            activeTabId === tab.id
              ? 'bg-card border-border'
              : 'bg-muted/50 border-transparent hover:bg-muted'
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
