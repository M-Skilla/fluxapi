/// <reference types="vite/client" />

interface Api {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  getCollections: () => Promise<any[]>
  addCollection: (data: { name: string }) => Promise<any>
  updateCollection: (data: { id: number; name?: string }) => Promise<any>
  deleteCollection: (collectionId: number) => Promise<void>
  getRequests: (collectionId: number) => Promise<any[]>
  getRequest: (requestId: number) => Promise<any>
  addRequest: (data: {
    collection_id: number | null
    name: string
    method: string
    url: string
    queryParams?: string
    headers?: string
    auth?: string
    body?: string
  }) => Promise<any>
  updateRequest: (data: {
    id: number
    name?: string
    method?: string
    url?: string
    queryParams?: string
    headers?: string
    auth?: string
    body?: string
  }) => Promise<any>
  deleteRequest: (requestId: number) => Promise<void>
  sendHttpRequest: (config: {
    method: string
    url: string
    headers?: Record<string, string>
    data?: any
    params?: Record<string, string>
  }) => Promise<any>
}

declare global {
  interface Window {
    api: Api
  }
}
