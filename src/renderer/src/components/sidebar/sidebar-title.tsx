'use client'
import Logo from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useSidebarStore } from '@/lib/store/sidebar-store'

export function SidebarTitle() {
 const setShowCollectionInput = useSidebarStore(state => state.setShowCollectionInput)


  const handleNewCollection = () => {
    setShowCollectionInput(true)
  }
  

  return (
    <div className='flex flex-col text-neutral-300'>
      
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img src={Logo} className="h-9 w-9" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-1 items-center gap-2 cursor-pointer h-auto font-medium"
              >
                API Client
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Switch Space</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Personal Space</DropdownMenuItem>
              <DropdownMenuItem>Work Space</DropdownMenuItem>
              <DropdownMenuItem>Project Alpha</DropdownMenuItem>
              {/* Add more spaces as needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Add New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(handleNewCollection)}>New Collection</DropdownMenuItem>
            <DropdownMenuItem>New Request</DropdownMenuItem>
            <DropdownMenuItem>New Environment</DropdownMenuItem>
            <DropdownMenuItem>Import Collection</DropdownMenuItem>
            {/* Add more options as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      
    </div>
    
      </div>
  )
}
