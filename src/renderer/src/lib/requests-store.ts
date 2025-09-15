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
  body: string | null
  created_at: string
}

export interface CreateRequestRequest {
  collection_id: number
  name?: string
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
}

export interface UpdateRequestRequest {
  id: number
  name?: string
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: string
}

// API functions
const getRequests = async (collectionId: number): Promise<Request[]> => {
  return await window.api.getRequests(collectionId)
}

const createRequest = async (data: CreateRequestRequest): Promise<{ id: number }> => {
  // Convert headers object to JSON string if provided
  const requestData = {
    ...data,
    headers: data.headers ? JSON.stringify(data.headers) : null
  }
  return await window.api.addRequest(requestData)
}

const updateRequest = async (data: UpdateRequestRequest): Promise<{ changes: number }> => {
  // Convert headers object to JSON string if provided
  const requestData = {
    ...data,
    headers: data.headers ? JSON.stringify(data.headers) : null
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
      // Update the corresponding tab title if the request name was changed
      if (variables.name) {
        const requestTab = tabs.find(
          (tab) => tab.type === 'request' && (tab.content as any)?.id === variables.id
        )
        if (requestTab) {
          updateTab(requestTab.id, { title: variables.name })
        }
      }

      // Invalidate all requests queries since we don't know the collection_id
      queryClient.invalidateQueries({ queryKey: ['requests'] })
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
      return 'bg-green-500'
    case 'POST':
      return 'bg-blue-500'
    case 'PUT':
      return 'bg-orange-500'
    case 'DELETE':
      return 'bg-red-500'
    case 'PATCH':
      return 'bg-purple-500'
    case 'HEAD':
      return 'bg-gray-500'
    case 'OPTIONS':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}
