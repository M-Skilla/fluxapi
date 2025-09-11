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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { data: collections = [] } = useCollections()
  const createCollectionMutation = useCreateCollection()

  const toggleCollection = useSidebarStore((state) => state.toggleCollection)

  const openCollections = useSidebarStore((state) => state.openCollections)

  
  const showCollectionInput = useSidebarStore((state) => state.showCollectionInput)
  const setShowCollectionInput = useSidebarStore((state) => state.setShowCollectionInput)
  
  
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
                          <CollectionMenuButton collection={collection} isOpen={isOpen} toggleCollection={toggleCollection} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 space-y-1">
                          <SidebarMenuItem>
                            <SidebarMenuButton className="hover:bg-primary/30 text-muted-foreground">
                              <span className="text-sm">No requests yet</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          {/* Add new request button */}
                          <SidebarMenuItem>
                            <SidebarMenuButton className="hover:bg-primary/30 text-muted-foreground">
                              <Plus size={14} />
                              <span className="text-sm">Add Request</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
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
