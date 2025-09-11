import { Button } from '../ui/button'
import { ChevronsUpDown, FolderPlus, Plus } from 'lucide-react'
import { Separator } from '../ui/separator'
import useSidebarStore from '@/lib/store/sidebar-store'



const SidebarActions = () => {
  const collapseCollection = useSidebarStore(state => state.collapseCollections)
  return (
    <div className="flex justify-around border-b">
      <Button variant="ghost" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
      <Separator orientation='vertical' />
      <Button variant="ghost" size="sm">
        <FolderPlus className="h-4 w-4" />
      </Button>
      <Separator orientation='vertical'/>
      <Button variant="ghost" size="sm" onClick={collapseCollection} >
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default SidebarActions
