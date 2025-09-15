import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTabsStore } from './tabs-store'

// Types
export interface Request {
  id: number
  collection_id: number
  name: string | null
  method: string
  url: string
  queryParams: string | null
  headers: string | null
  auth: string | null
  body: string | null
  created_at: string
}

export interface CreateRequestRequest {
  collection_id: number
  name?: string
  method: string
  url: string
  headers?: Record<string, string>
  queryParams?: Record<string, string>
  auth?: Record<string, any>
  body?: string
}

export interface UpdateRequestRequest {
  id: number
  name?: string
  method?: string
  url?: string
  headers?: Record<string, string>
  queryParams?: Record<string, string>
  auth?: Record<string, any>
  body?: string
}

// API functions
const getRequests = async (collectionId: number): Promise<Request[]> => {
  return await window.api.getRequests(collectionId)
}

const getRequest = async (requestId: number): Promise<Request | undefined> => {
  return await window.api.getRequest(requestId)
}

const createRequest = async (data: CreateRequestRequest): Promise<{ id: number }> => {
  // Convert objects to JSON strings if provided
  const requestData = {
    ...data,
    queryParams: data.queryParams ? JSON.stringify(data.queryParams) : '{}',
    headers: data.headers ? JSON.stringify(data.headers) : null,
    auth: data.auth ? JSON.stringify(data.auth) : null
  }
  return await window.api.addRequest(requestData)
}

const updateRequest = async (data: UpdateRequestRequest): Promise<{ changes: number }> => {
  // Convert objects to JSON strings if provided
  const requestData = {
    ...data,
    queryParams: data.queryParams ? JSON.stringify(data.queryParams) : '{}',
    headers: data.headers ? JSON.stringify(data.headers) : null,
    auth: data.auth ? JSON.stringify(data.auth) : null
  }
  return await window.api.updateRequest(requestData)
}

const deleteRequest = async (requestId: number): Promise<{ changes: number }> => {
  return await window.api.deleteRequest(requestId)
}

// React Query hooks
export const useRequests = (collectionId: number) => {
  return useQuery({
    queryKey: ['requests', collectionId],
    queryFn: () => getRequests(collectionId),
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useRequest = (requestId: number) => {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: () => getRequest(requestId),
    enabled: !!requestId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      // Invalidate requests for the specific collection
      queryClient.invalidateQueries({
        queryKey: ['requests']
      })
    },
    onError: (error) => {
      console.error('Failed to create request:', error)
    }
  })
}

export const useUpdateRequest = () => {
  const queryClient = useQueryClient()
  const { tabs, updateTab } = useTabsStore()

  return useMutation({
    mutationFn: updateRequest,
    onSuccess: (_, variables) => {
      // Update the corresponding tab title and content if the request name was changed
      if (variables.name) {
        const requestTab = tabs.find(
          (tab) => tab.type === 'request' && (tab.content as any)?.id === variables.id
        )
        if (requestTab) {
          updateTab(requestTab.id, {
            title: variables.name,
            content: {
              ...requestTab.content,
              ...variables
            }
          })
        }
      } else {
        // Update tab content for other changes
        const requestTab = tabs.find(
          (tab) => tab.type === 'request' && (tab.content as any)?.id === variables.id
        )
        if (requestTab) {
          updateTab(requestTab.id, {
            content: {
              ...requestTab.content,
              ...variables
            }
          })
        }
      }

      // Invalidate all requests queries since we don't know the collection_id
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      // Also invalidate the specific request query
      queryClient.invalidateQueries({ queryKey: ['request', variables.id] })
    },
    onError: (error) => {
      console.error('Failed to update request:', error)
    }
  })
}

export const useDeleteRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      // Invalidate all requests queries
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (error) => {
      console.error('Failed to delete request:', error)
    }
  })
}

// Helper functions
export const validateRequestData = (data: Partial<CreateRequestRequest>): boolean => {
  return !!(data.method && data.url && data.collection_id !== undefined)
}

export const parseRequestHeaders = (headersJson: string | null): Record<string, string> => {
  if (!headersJson) return {}
  try {
    return JSON.parse(headersJson)
  } catch {
    return {}
  }
}

export const stringifyRequestHeaders = (headers: Record<string, string>): string => {
  return JSON.stringify(headers)
}

export const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'text-green-500'
    case 'POST':
      return 'text-blue-500'
    case 'PUT':
      return 'text-orange-500'
    case 'DELETE':
      return 'text-red-500'
    case 'PATCH':
      return 'text-purple-500'
    case 'HEAD':
      return 'text-gray-500'
    case 'OPTIONS':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}
