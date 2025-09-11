import React, { useState } from 'react'
import { SidebarMenuButton } from '../ui/sidebar'
import { ChevronRight, Folder, MoreHorizontal } from 'lucide-react'
import { Collection, useUpdateCollection, useDeleteCollection } from '@/lib/collections-store'
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

const CollectionMenuButton = ({
  collection,
  isOpen,
  toggleCollection
}: {
  collection: Collection
  isOpen: boolean
  toggleCollection: (id: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(collection.name)
  const [showMenu, setShowMenu] = useState(false)

  const updateMutation = useUpdateCollection()
  const deleteMutation = useDeleteCollection()

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
    if (editName.trim() && editName !== collection.name) {
      updateMutation.mutate({ id: collection.id, name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditName(collection.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  if (isEditing) {
    return (
      <SidebarMenuButton className="w-full justify-start hover:bg-primary/30 cursor-pointer">
        <div className="flex items-center gap-2 flex-1">
          <Folder size={16} />
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.stopPropagation()}
            className="h-6 px-1 text-sm font-medium"
          />
        </div>
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuButton
      className="w-full justify-between hover:bg-primary/30 cursor-pointer"
      onMouseOver={() => setShowMenu(true)}
      onMouseOut={() => setShowMenu(false)}
      onClick={() => toggleCollection(collection.id.toString())}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          <Folder size={16} />
        </div>{' '}
        <span className="font-medium line-clamp-1 transition-all ease-in-out">{collection.name}</span>
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
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="transition-all ease-linear duration-200"
          >
            <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{collection.name}"? This action cannot be
                    undone and will also delete all requests in this collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(collection.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </div>
    </SidebarMenuButton>
  )
}

export default CollectionMenuButton
