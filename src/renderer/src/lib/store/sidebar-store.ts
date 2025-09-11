import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  openCollections: string[]
  toggleCollection: (id: string) => void
  collapseCollections: () => void
  showCollectionInput: boolean
setShowCollectionInput: (show: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      openCollections: [],
      toggleCollection: (id) =>
        set((state) => {
          const open = state.openCollections.includes(id)
          return {
            openCollections: open
              ? state.openCollections.filter((cid) => cid !== id)
              : [...state.openCollections, id]
          }
        }),
      collapseCollections: () => set({ openCollections: [] }),
      showCollectionInput: false,
      setShowCollectionInput: (show) => set({ showCollectionInput: show })
      
    }),
    {
      name: 'sidebar-storage',
      version: 1,
      partialize: (state) => ({ openCollections: state.openCollections }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate sidebar storage:', error)
          return
        }
        if (state && state.openCollections) {
          if (state.openCollections instanceof Set) {
            state.openCollections = Array.from(state.openCollections)
          }
          if (!Array.isArray(state.openCollections)) {
            state.openCollections = []
          }
        }
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0 && persistedState?.openCollections instanceof Set) {
          return {
            ...persistedState,
            openCollections: Array.from(persistedState.openCollections)
          }
        }
        return persistedState
      }
    }
  )
)

export default useSidebarStore
