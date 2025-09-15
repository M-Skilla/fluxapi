import React, { useState } from 'react'
import { SidebarMenuButton } from '../ui/sidebar'
import { FileText, MoreHorizontal } from 'lucide-react'
import { Request, useUpdateRequest, useDeleteRequest } from '@/lib/requests-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { getMethodColor } from '@/lib/requests-store'
import { useTabsStore } from '@/lib'

interface RequestMenuButtonProps {
  request: Request
  onClick?: () => void
}

const RequestMenuButton = ({ request, onClick }: RequestMenuButtonProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(request.name || 'Untitled')
  const [showMenu, setShowMenu] = useState(false)

  const updateMutation = useUpdateRequest()
  const deleteMutation = useDeleteRequest()
  const { tabs, closeTab } = useTabsStore()

  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 0)
    }
  }, [isEditing])

  const handleEditSave = () => {
    if (editName.trim() && editName !== (request.name || 'Untitled')) {
      updateMutation.mutate({
        id: request.id,
        name: editName.trim()
      })
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditName(request.name || 'Untitled')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const handleDelete = () => {
    // Find and close any open tab for this request
    const openTab = tabs.find(
      (tab) => tab.type === 'request' && (tab.content as any)?.id === request.id
    )

    if (openTab) {
      closeTab(openTab.id)
    }

    // Delete the request
    deleteMutation.mutate(request.id)
  }
  if (isEditing) {
    return (
      <SidebarMenuButton className="w-full justify-start hover:bg-primary/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
            <FileText size={16} />
          </div>
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            className="h-6 px-1 text-sm font-medium flex-1 min-w-0"
          />
        </div>
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuButton
      className="w-full justify-between hover:bg-primary/30"
      onMouseOver={() => setShowMenu(true)}
      onMouseOut={() => setShowMenu(false)}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          <FileText size={16} />
        </div>
        <div
          className={`px-1 py-0.5 rounded text-xs font-medium text-white ${getMethodColor(request.method)}`}
        >
          {request.method}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium line-clamp-1 text-xs">{request.name || 'Untitled'}</div>
          <div className="text-xs text-muted-foreground truncate">{request.url}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {showMenu && (
              <button
                className="transition-all ease-linear duration-200 p-1 hover:bg-primary/20 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              Edit
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{request.name || 'Untitled'}"? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarMenuButton>
  )
}

export default RequestMenuButton
