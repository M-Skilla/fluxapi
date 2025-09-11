import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface Collection {
  id: number
  name: string
  created_at: string
}

export interface CreateCollectionRequest {
  name: string
}

export interface UpdateCollectionRequest {
  id: number
  name?: string
}

// API functions
const getCollections = async (): Promise<Collection[]> => {
  return await window.api.getCollections()
}

const createCollection = async (data: CreateCollectionRequest): Promise<{ id: number }> => {
  return await window.api.addCollection(data)
}

const updateCollection = async (data: UpdateCollectionRequest): Promise<{ changes: number }> => {
  return await window.api.updateCollection(data)
}

const deleteCollection = async (collectionId: number): Promise<{ changes: number }> => {
  return await window.api.deleteCollection(collectionId)
}

// React Query hooks
export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: getCollections,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useCreateCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      // Invalidate and refetch collections
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      console.error('Failed to create collection:', error)
    }
  })
}

export const useUpdateCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCollection,
    onSuccess: () => {
      // Invalidate and refetch collections
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      console.error('Failed to update collection:', error)
    }
  })
}

export const useDeleteCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      // Invalidate and refetch collections
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      // Also invalidate requests since deleting a collection will cascade delete its requests
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (error) => {
      console.error('Failed to delete collection:', error)
    }
  })
}

// Helper functions
export const validateCollectionName = (name: string): boolean => {
  return name.trim().length > 0
}
