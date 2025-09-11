import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  openCollections: string[]
  toggleCollection: (id: string) => void
  collapseCollections: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      openCollections: [],
      toggleCollection: (id: string) =>
        set((state) => {
          const open = state.openCollections.includes(id)
          return {
            openCollections: open
              ? state.openCollections.filter((cid) => cid !== id)
              : [...state.openCollections, id]
          }
        }),
      collapseCollections: () => set({ openCollections: [] })
    }),
    {
      name: 'sidebar-storage',
      version: 1,
      partialize: (state) => ({ openCollections: state.openCollections }),
      // Handle migration from Set to Array
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate sidebar storage:', error)
          return
        }
        if (state && state.openCollections) {
          // If openCollections is a Set (from old version), convert to array
          if (state.openCollections instanceof Set) {
            state.openCollections = Array.from(state.openCollections)
          }
          // Ensure it's always an array
          if (!Array.isArray(state.openCollections)) {
            state.openCollections = []
          }
        }
      },
      // Clear old storage if migration fails
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
