import { create } from 'zustand'

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  responseTime: number
  size: number
  url: string
  method: string
}

export interface ResponseState {
  response: ResponseData | null
  isLoading: boolean
  error: string | null
  setResponse: (response: ResponseData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  sendRequest: (config: {
    method: string
    url: string
    headers?: Record<string, string>
    data?: any
    params?: Record<string, string>
  }) => Promise<void>
  clearResponse: () => void
}

export const useResponseStore = create<ResponseState>((set, get) => ({
  response: null,
  isLoading: false,
  error: null,

  setResponse: (response) => set({ response, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, response: null }),

  sendRequest: async (config) => {
    const { setLoading, setResponse, setError } = get()

    setLoading(true)
    setError(null)

    try {
      // Use the preload API instead of direct ipcRenderer
      const result = await (window as any).api.sendHttpRequest(config)

      if (result.success) {
        setResponse(result.data)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError(`IPC Error: ${error}`)
    } finally {
      setLoading(false)
    }
  },

  clearResponse: () => set({ response: null, error: null })
}))
