import { create } from 'zustand'
import axios, { AxiosResponse, AxiosError } from 'axios'

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

    const startTime = Date.now()

    try {
      const response: AxiosResponse = await axios({
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
        params: config.params,
        timeout: 30000 // 30 second timeout
      })

      const responseTime = Date.now() - startTime
      const size = JSON.stringify(response.data).length

      const responseData: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        responseTime,
        size,
        url: config.url,
        method: config.method
      }

      setResponse(responseData)
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // Server responded with error status
          const errorResponse: ResponseData = {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            headers: axiosError.response.headers as Record<string, string>,
            data: axiosError.response.data,
            responseTime,
            size: JSON.stringify(axiosError.response.data).length,
            url: config.url,
            method: config.method
          }
          setResponse(errorResponse)
        } else if (axiosError.request) {
          // Request was made but no response received
          setError(`Network Error: ${axiosError.message}`)
        } else {
          // Something else happened
          setError(`Request Error: ${axiosError.message}`)
        }
      } else {
        setError(`Unknown Error: ${error}`)
      }
    } finally {
      setLoading(false)
    }
  },

  clearResponse: () => set({ response: null, error: null })
}))
