import { Button } from '../ui/button'
import { ChevronsUpDown, FolderPlus, Plus } from 'lucide-react'
import useSidebarStore from '@/lib/store/sidebar-store'
import { useCreateRequest, useTabsStore } from '@/lib'



const SidebarActions = () => {
const createRequestMutation = useCreateRequest()
  const { addTab } = useTabsStore()

  const handleAddRequest = async () => {
    try {
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

  const collapseCollection = useSidebarStore(state => state.collapseCollections)
  const setShowCollectionInput = useSidebarStore(state => state.setShowCollectionInput)
  return (
    <div className="flex justify-center gap-5 border-b mt-[5.5px]">
      <Button variant="ghost" size="sm" onClick={handleAddRequest} >
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
