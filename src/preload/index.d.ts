import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      getCollections: () => Promise<Array<{ id: number; name: string; created_at: string }>>
      addCollection: (data: { name: string }) => Promise<{ id: number }>
      updateCollection: (data: { id: number; name?: string }) => Promise<{ changes: number }>
      deleteCollection: (collectionId: number) => Promise<{ changes: number }>
      getRequests: (collectionId: number) => Promise<Array<any>>
      addRequest: (data: any) => Promise<{ id: number }>
      updateRequest: (data: any) => Promise<{ changes: number }>
      deleteRequest: (requestId: number) => Promise<{ changes: number }>
    }
  }
}
