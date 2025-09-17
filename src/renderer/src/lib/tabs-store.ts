import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tab } from './types'

interface TabsState {
  tabs: Tab[]
  activeTabId: string | null

  // Actions
  addTab: (tab: Omit<Tab, 'id'>) => Promise<void>
  addRequestTab: (collectionId?: number) => Promise<void>
  removeTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  setActiveTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  closeAllTabs: () => void
  closeOtherTabs: (tabId: string) => void
  duplicateTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void

  // Getters
  getActiveTab: () => Tab | null
  getTabById: (tabId: string) => Tab | null
  getTabsByType: (type: Tab['type']) => Tab[]
  validateTabs: () => Promise<void>

  // Manual validation trigger
  validateTabsManually: () => void
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      addTab: async (tabData) => {
        const newTab: Tab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...tabData,
          lastModified: new Date()
        }

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id
        }))
      },

      addRequestTab: async (collectionId) => {
        try {
          // Create database record first
          const dbResult = await window.api.addRequest({
            collection_id: collectionId || null,
            name: 'Untitled',
            method: 'GET',
            url: '',
            queryParams: JSON.stringify({}),
            headers: JSON.stringify({}),
            auth: JSON.stringify({ type: 'no-auth' }),
            body: null
          })

          // Create tab with database ID reference
          const newTab: Tab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Untitled',
            type: 'request',
            content: {
              id: dbResult.id,
              method: 'GET',
              url: '',
              headers: {},
              queryParams: {},
              auth: { type: 'no-auth' },
              collectionId: collectionId
            },
            isDirty: false,
            lastModified: new Date()
          }

          set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id
          }))
        } catch (error) {
          console.error('Failed to create request tab:', error)
        }
      },

      removeTab: (tabId) => {
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== tabId)
          let newActiveTabId = state.activeTabId

          // If we're removing the active tab, switch to another tab
          if (state.activeTabId === tabId) {
            const removedTabIndex = state.tabs.findIndex((tab) => tab.id === tabId)
            if (newTabs.length > 0) {
              // Try to select the next tab, or the previous one if it's the last
              const nextIndex =
                removedTabIndex < newTabs.length ? removedTabIndex : removedTabIndex - 1
              newActiveTabId = newTabs[Math.max(0, nextIndex)]?.id || null
            } else {
              newActiveTabId = null
            }
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId
          }
        })
      },

      updateTab: (tabId, updates) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, ...updates, lastModified: new Date() } : tab
          )
        }))
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId })
      },

      closeTab: (tabId) => {
        get().removeTab(tabId)
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null })
      },

      closeOtherTabs: (tabId) => {
        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.id === tabId),
          activeTabId: tabId
        }))
      },

      duplicateTab: (tabId) => {
        const originalTab = get().getTabById(tabId)
        if (originalTab) {
          const duplicatedTab: Omit<Tab, 'id'> = {
            title: `${originalTab.title} (Copy)`,
            type: originalTab.type,
            content: originalTab.content,
            isDirty: false,
            lastModified: new Date()
          }
          get().addTab(duplicatedTab)
        }
      },

      reorderTabs: (fromIndex, toIndex) => {
        set((state) => {
          const newTabs = [...state.tabs]
          const [movedTab] = newTabs.splice(fromIndex, 1)
          newTabs.splice(toIndex, 0, movedTab)
          return { tabs: newTabs }
        })
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get()
        return tabs.find((tab) => tab.id === activeTabId) || null
      },

      getTabById: (tabId) => {
        return get().tabs.find((tab) => tab.id === tabId) || null
      },

      getTabsByType: (type) => {
        return get().tabs.filter((tab) => tab.type === type)
      },

      validateTabs: async () => {
        const currentTabs = get().tabs
        const requestTabs = currentTabs.filter((tab) => tab.type === 'request')

        if (requestTabs.length === 0) return

        try {
          const validationPromises = requestTabs.map(async (tab) => {
            if (tab.content?.id) {
              try {
                const request = await window.api.getRequest(tab.content.id)
                if (!request) {
                  console.warn(`Removing tab ${tab.id}: request ${tab.content.id} not found`)
                  return tab.id
                }
              } catch (error) {
                console.warn(`Error validating request ${tab.content.id} for tab ${tab.id}:`, error)
                // Don't remove tab on network errors, just log
                return null
              }
            }
            return null
          })

          const tabsToRemove = (await Promise.all(validationPromises)).filter(Boolean) as string[]

          // Remove invalid tabs
          if (tabsToRemove.length > 0) {
            set((state) => {
              const newTabs = state.tabs.filter((tab) => !tabsToRemove.includes(tab.id))
              let newActiveTabId = state.activeTabId

              // If active tab was removed, switch to another tab
              if (state.activeTabId && tabsToRemove.includes(state.activeTabId)) {
                const removedTabIndex = state.tabs.findIndex((tab) => tab.id === state.activeTabId)
                if (newTabs.length > 0) {
                  const nextIndex = Math.min(removedTabIndex, newTabs.length - 1)
                  newActiveTabId = newTabs[nextIndex]?.id || null
                } else {
                  newActiveTabId = null
                }
              }

              return {
                tabs: newTabs,
                activeTabId: newActiveTabId
              }
            })

            console.log(`Cleaned up ${tabsToRemove.length} invalid tabs`)
          }
        } catch (error) {
          console.error('Error during tab validation:', error)
        }
      },

      // Manual validation trigger
      validateTabsManually: () => {
        get().validateTabs()
      }
    }),
    {
      name: 'tabs-storage',
      partialize: (state) => ({
        tabs: state.tabs.map((tab) => ({
          ...tab,
          // Don't persist content that might be large or contain functions
          content: tab.type === 'request' ? tab.content : undefined
        })),
        activeTabId: state.activeTabId
      })
    }
  )
)
