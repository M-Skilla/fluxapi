import React from 'react'
import { RequestTabContent } from '@/lib/types'
import RequestSelect from './request-select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { UpdateRequestRequest, useUpdateRequest } from '@/lib'
import { useRequest } from '@/lib/requests-store'
import ParamsSection from './params-section'
import HeadersSection from './headers-section'

// Simple debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

interface RequestTabProps {
  content: RequestTabContent
}

const RequestTab: React.FC<RequestTabProps> = ({ content }) => {
  // Fetch fresh data from database on mount
  const { data: dbRequest, isLoading: isDbLoading } = useRequest(content.id!)

  const [requestObj, setRequestObj] = React.useState<UpdateRequestRequest>({
    id: content.id!,
    method: content.method || 'GET',
    url: content.url || '',
    headers: content.headers || {},
    queryParams: content.queryParams || {},
    body: content.body || ''
  })

  const hasInitialized = React.useRef(false)

  // Update local state only when database data is first loaded (on mount)
  React.useEffect(() => {
    if (!hasInitialized.current && dbRequest && !isDbLoading) {
      setRequestObj({
        id: dbRequest.id,
        method: dbRequest.method,
        url: dbRequest.url,
        headers: dbRequest.headers ? JSON.parse(dbRequest.headers) : {},
        queryParams: dbRequest.queryParams ? JSON.parse(dbRequest.queryParams) : {},
        body: dbRequest.body || ''
      })
      hasInitialized.current = true
    }
  }, [dbRequest, isDbLoading])

  const updateRequest = useUpdateRequest()

  const updateRequestDebounced = React.useCallback(
    (updates: Partial<UpdateRequestRequest>) => {
      if (content.id) {
        debounce(() => {
          updateRequest.mutateAsync({ ...requestObj, ...updates })
        }, 300)()
      }
    },
    [content.id, requestObj, updateRequest]
  )

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setRequestObj((prev) => ({ ...prev, url: newUrl }))
    updateRequestDebounced({ url: newUrl })
  }

  const sendRequest = () => {
    setTimeout(() => {
      console.log('Sending request...')
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full ">
      <div className="flex gap-3 items-center py-2 px-4 border-b bg-sidebar">
        <RequestSelect
          method={requestObj.method!}
          setMethod={(method) => {
            setRequestObj((prev) => ({ ...prev, method }))
            if (content.id) {
              debounce(() => {
                updateRequest.mutateAsync({ ...requestObj, method })
              }, 300)()
            }
          }}
        />
        <Input
          value={requestObj.url}
          onChange={(e) => handleUrlChange(e)}
          className="flex-1 text-neutral-200"
          placeholder="https://jsonplaceholder.typicode.com/posts"
        />
        <Button onClick={sendRequest} className="text-neutral-200" size="sm">
          <Send className="h-4 w-4" />
          <span>Send</span>
        </Button>
      </div>
      <div className="flex h-full">
        <div className="flex flex-col w-1/2 border-r">
          <Tabs defaultValue="params" className="">
            <TabsList>
              <TabsTrigger value="params">Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="exports">Exports</TabsTrigger>
            </TabsList>
            <TabsContent value="params">
              <ParamsSection
                queryParams={requestObj.queryParams || {}}
                onParamsChange={(params) =>
                  setRequestObj((prev) => ({ ...prev, queryParams: params }))
                }
                onSaveToDatabase={(updates) =>
                  updateRequest.mutateAsync({ ...requestObj, ...updates })
                }
              />
            </TabsContent>
            <TabsContent value="headers">
              <HeadersSection
                headers={requestObj.headers || {}}
                onHeadersChange={(headers) => setRequestObj((prev) => ({ ...prev, headers }))}
                onSaveToDatabase={(updates) =>
                  updateRequest.mutateAsync({ ...requestObj, ...updates })
                }
              />
            </TabsContent>
            <TabsContent value="auth">
              <div className="flex flex-col p-4 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-medium">Auth</h2>
                  <Button size="sm" variant="outline">
                    Add Auth
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="body">
              <div className="flex flex-col p-4 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-medium">Body</h2>
                  <Button size="sm" variant="outline">
                    Add Body
                  </Button>
                </div>
                <div className="mt-4 flex-1">
                  <textarea
                    value={requestObj.body || ''}
                    onChange={(e) => {
                      const newBody = e.target.value
                      setRequestObj((prev) => ({ ...prev, body: newBody }))
                      debounce(() => {
                        updateRequest.mutateAsync({ ...requestObj, body: newBody })
                      }, 300)()
                    }}
                    placeholder="Enter request body..."
                    className="w-full h-full p-2 border rounded-md resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="exports">
              <div className="flex flex-col p-4 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-medium">Exports</h2>
                  <Button size="sm" variant="outline">
                    Add Export
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex flex-col w-1/2 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">
              {requestObj.method} {requestObj.url || <span className="text-muted">(no url)</span>}
            </h2>
            {content.id && (
              <div className="text-xs text-muted-foreground mb-2">
                Request ID: {content.id}
                {content.collectionId && ` | Collection ID: ${content.collectionId}`}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <div className="text-sm text-muted-foreground">{requestObj.method}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <div className="text-sm text-muted-foreground">{requestObj.url || 'No URL set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Headers</label>
              <div className="text-xs text-muted-foreground">
                {Object.keys(requestObj.headers || {}).length} headers
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Query Parameters</label>
              <div className="text-xs text-muted-foreground">
                {Object.keys(requestObj.queryParams || {}).length} parameters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestTab
