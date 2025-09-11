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
import { ChevronDown, Folder, History, Settings, Plus, Server } from 'lucide-react'
import { useCollections } from '@/lib/collections-store'
import { useLocation } from 'react-router'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { data: collections = [] } = useCollections()
  const [openCollections, setOpenCollections] = React.useState<Set<string>>(new Set())

  const toggleCollection = (collectionId: string) => {
    setOpenCollections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  return (
    <Sidebar {...props} className="flex flex-col">
      <SidebarHeader className="border-b">
        <SidebarTitle />
      </SidebarHeader>
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
                  const isOpen = openCollections.has(collectionId)
                  return (
                    <Collapsible
                      key={collectionId}
                      open={isOpen}
                      onOpenChange={() => toggleCollection(collectionId)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between hover:bg-primary/30">
                            <div className="flex items-center gap-2">
                              <Folder size={16} />
                              <span className="font-medium">{collection.name}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 space-y-1">
                          {/* Placeholder for requests - will be populated when requests are implemented */}
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
