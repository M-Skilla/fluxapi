import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SidebarTitle } from './sidebar-title'
import { History, Settings, Plus, Server } from 'lucide-react'
import {
  useCollections,
  useCreateCollection,
  validateCollectionName
} from '@/lib/collections-store'
import { useLocation } from 'react-router'
import SidebarActions from './sidebar-actions'
import useSidebarStore from '@/lib/store/sidebar-store'
import { CollectionNameInput } from '../CollectionNameInput'
import CollectionMenuButton from './collection-menu-button'
import { useTabsStore } from '@/lib/tabs-store'
import { useRequests, useCreateRequest } from '@/lib/requests-store'
import RequestMenuButton from './request-menu-button'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { data: collections = [] } = useCollections()
  const createCollectionMutation = useCreateCollection()

  const toggleCollection = useSidebarStore((state) => state.toggleCollection)

  const openCollections = useSidebarStore((state) => state.openCollections)

  const showCollectionInput = useSidebarStore((state) => state.showCollectionInput)
  const setShowCollectionInput = useSidebarStore((state) => state.setShowCollectionInput)

  const { tabs, setActiveTab, addTab } = useTabsStore()

  const safeOpenCollections = Array.isArray(openCollections) ? openCollections : []
  const handleSaveCollection = async (name: string) => {
    if (validateCollectionName(name)) {
      try {
        await createCollectionMutation.mutateAsync({ name })
        setShowCollectionInput(false)
      } catch (error) {
        console.error('Failed to create collection:', error)
      }
    }
  }

  const handleCancelCollection = () => {
    setShowCollectionInput(false)
  }

  return (
    <Sidebar {...props} className="flex flex-col text-neutral-400">
      <SidebarHeader className="border-b-2">
        <SidebarTitle />
      </SidebarHeader>
      <SidebarActions />
      <SidebarContent className="flex-1 min-h-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {collections.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>No collections yet</SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                collections.map((collection) => {
                  const collectionId = collection.id.toString()
                  const isOpen = safeOpenCollections.includes(collectionId)
                  return (
                    <Collapsible
                      key={collectionId}
                      open={isOpen}
                      onOpenChange={() => toggleCollection(collectionId)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <CollectionMenuButton
                            collection={collection}
                            isOpen={isOpen}
                            toggleCollection={toggleCollection}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 space-y-1">
                          <CollectionRequests
                            collectionId={collection.id}
                            onRequestClick={(request) => {
                              // Find existing tab for this request or create new one
                              const existingTab = tabs.find(
                                (tab) =>
                                  tab.type === 'request' && (tab.content as any)?.id === request.id
                              )

                              if (existingTab) {
                                setActiveTab(existingTab.id)
                              } else {
                                // Create new tab with existing request data
                                addTab({
                                  title: request.name || 'Untitled',
                                  type: 'request',
                                  content: {
                                    id: request.id,
                                    collectionId: request.collection_id,
                                    method: request.method,
                                    url: request.url,
                                    headers: request.headers ? JSON.parse(request.headers) : {},
                                    queryParams: request.queryParams
                                      ? JSON.parse(request.queryParams)
                                      : {},
                                    body: request.body
                                      ? typeof request.body === 'string'
                                        ? {
                                            type: 'text',
                                            content: request.body,
                                            contentType: 'json'
                                          }
                                        : JSON.parse(request.body)
                                      : { type: 'none' }
                                  }
                                })
                              }
                            }}
                          />
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })
              )}
              {showCollectionInput && (
                <CollectionNameInput
                  onSave={handleSaveCollection}
                  onCancel={handleCancelCollection}
                  placeholder="Enter collection name..."
                />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {[
            { title: 'History', url: '/history', icon: History },
            { title: 'Environments', url: '/env', icon: Server },
            { title: 'Settings', url: '/settings', icon: Settings }
          ].map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={`hover:bg-primary/30 ${isActive ? 'bg-primary/20' : ''}`}
                  asChild
                >
                  <a href={item.url} className="flex items-center gap-2 text-sm font-normal">
                    {item.icon && <item.icon size={16} />}
                    {item.title}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

interface CollectionRequestsProps {
  collectionId: number
  onRequestClick: (request: any) => void
}

const CollectionRequests: React.FC<CollectionRequestsProps> = ({
  collectionId,
  onRequestClick
}) => {
  const { data: requests = [], isLoading } = useRequests(collectionId)
  const createRequestMutation = useCreateRequest()
  const { addTab } = useTabsStore()

  const handleAddRequest = async () => {
    try {
      const result = await createRequestMutation.mutateAsync({
        collection_id: collectionId,
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
          collectionId: collectionId,
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

  if (isLoading) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled>
          <span className="text-sm">Loading requests...</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <>
      {requests.length === 0 ? (
        <SidebarMenuItem>
          <SidebarMenuButton className="hover:bg-primary/30 text-muted-foreground">
            <span className="text-sm">No requests yet</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : (
        requests.map((request) => (
          <SidebarMenuItem key={request.id}>
            <RequestMenuButton request={request} onClick={() => onRequestClick(request)} />
          </SidebarMenuItem>
        ))
      )}
      {/* Add new request button */}
      <SidebarMenuItem>
        <SidebarMenuButton
          className="hover:bg-primary/30 text-muted-foreground"
          onClick={handleAddRequest}
        >
          <Plus size={14} />
          <span className="text-sm">Add Request</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  )
}
