import { Button } from '../ui/button'
import { ChevronsUpDown, FolderPlus, Plus } from 'lucide-react'
import useSidebarStore from '@/lib/store/sidebar-store'



const SidebarActions = () => {
  const collapseCollection = useSidebarStore(state => state.collapseCollections)
  const setShowCollectionInput = useSidebarStore(state => state.setShowCollectionInput)
  return (
    <div className="flex justify-center gap-5 border-b">
      <Button variant="ghost" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowCollectionInput(true)} >
        <FolderPlus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={collapseCollection} >
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default SidebarActions
