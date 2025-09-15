// Tab-related types for the API client
export interface Tab {
  id: string
  title: string
  type: 'request' | 'collection' | 'environment' | 'history'
  content?: any
  isDirty?: boolean
  lastModified?: Date
}

export interface RequestTabContent {
  id?: number // Database ID
  collectionId?: number // Parent collection ID
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  url: string
  headers: Record<string, string>
  body?: string
  queryParams: Record<string, string>
}

export interface CollectionTabContent {
  collectionId: string
  requests: Array<{
    id: string
    name: string
    method: string
    url: string
  }>
}

export interface EnvironmentTabContent {
  environmentId: string
  variables: Record<string, string>
  isGlobal?: boolean
}

export interface HistoryTabContent {
  requestId: string
  timestamp: Date
  response?: {
    status: number
    headers: Record<string, string>
    body: string
    duration: number
  }
}

export type TabContent =
  | RequestTabContent
  | CollectionTabContent
  | EnvironmentTabContent
  | HistoryTabContent
