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
import AuthSection from './auth-section'
import BodySection from './body-section'
import CodeMirrorResponse from './cm-response'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { ChevronDown } from 'lucide-react'
import { useResponseStore } from '@/stores/response-store'

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
    auth: content.auth || {},
    body: content.body || "{ type: 'text', content: '', contentType: 'json' }"
  })

  const [hasErrors, setHasErrors] = React.useState(false)
  const [requestName, setRequestName] = React.useState('')
  const [responseCollapsed, setResponseCollapsed] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('request')

  // Response store
  const { response, isLoading, error, sendRequest } = useResponseStore()

  const hasInitialized = React.useRef(false)

  // Function to get status color based on HTTP status code
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400' // Success
    if (status >= 300 && status < 400) return 'text-blue-400' // Redirection
    if (status >= 400 && status < 500) return 'text-orange-400' // Client Error
    if (status >= 500) return 'text-red-400' // Server Error    
    return 'text-gray-400' // Unknown
  }

  // Function to get status text with fallback
  const getStatusText = (status: number, statusText?: string) => {
    if (statusText && statusText.trim()) return statusText
    // Fallback status texts
    if (status === 200) return 'OK'
    if (status === 201) return 'Created'
    if (status === 204) return 'No Content'
    if (status === 400) return 'Bad Request'
    if (status === 401) return 'Unauthorized'
    if (status === 403) return 'Forbidden'
    if (status === 404) return 'Not Found'
    if (status === 500) return 'Internal Server Error'
    return 'Unknown'
  }

  // Update local state only when database data is first loaded (on mount)
  React.useEffect(() => {
    if (!hasInitialized.current && dbRequest && !isDbLoading) {
      setRequestObj({
        id: dbRequest.id,
        method: dbRequest.method,
        url: dbRequest.url,
        headers: dbRequest.headers ? JSON.parse(dbRequest.headers) : {},
        queryParams: dbRequest.queryParams ? JSON.parse(dbRequest.queryParams) : {},
        auth: dbRequest.auth ? JSON.parse(dbRequest.auth) : {},
        body: dbRequest.body
          ? typeof dbRequest.body === 'string'
            ? JSON.parse(dbRequest.body)
            : dbRequest.body
          : { type: 'text', content: '', contentType: 'json' }
      })
      setRequestName(dbRequest.name || 'Untitled')
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setRequestName(newName)
    updateRequestDebounced({ name: newName })
  }

  const handleSendRequest = async () => {
    if (!requestObj.url) {
      alert('Please enter a URL')
      return
    }

    try {
      let requestData: any = undefined

      if (requestObj.body && typeof requestObj.body === 'object') {
        const bodyObj = requestObj.body as any
        if (bodyObj.content) {
          if (bodyObj.contentType === 'json') {
            try {
              requestData = JSON.parse(bodyObj.content)
            } catch {
              requestData = bodyObj.content
            }
          } else {
            requestData = bodyObj.content
          }
        }
      }

      await sendRequest({
        method: requestObj.method!,
        url: requestObj.url,
        headers: requestObj.headers || {},
        data: requestData,
        params: requestObj.queryParams || {}
      })

      // Switch to response tab when request completes
      setActiveTab('response')
    } catch (error) {
      console.error('Request failed:', error)
      setActiveTab('response') // Still switch to response tab to show error
    }
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
        <Button
          onClick={handleSendRequest}
          className="text-neutral-200"
          size="sm"
          disabled={hasErrors || isLoading || !requestObj.url}
        >
          <Send className="h-4 w-4" />
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
        </Button>
      </div>
      <div className="flex h-full">
        <div className="flex flex-col w-1/2 border-r">
          <Tabs defaultValue="params" className="h-full">
            <TabsList>
              <TabsTrigger value="params">
                Params{' '}
                {Object.keys(requestObj.queryParams || {}).length > 0 && (
                  <span className="text-primary font-extrabold">
                    {Object.keys(requestObj.queryParams || {}).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="headers">
                Headers{' '}
                {Object.keys(requestObj.headers || {}).length > 0 && (
                  <span className="text-primary font-extrabold">
                    {Object.keys(requestObj.headers || {}).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="auth">
                Auth{' '}
                {requestObj.auth && requestObj.auth?.type !== 'no-auth' ? (
                  <div className="bg-primary w-2 h-2 rounded-full"></div>
                ) : (
                  <></>
                )}
              </TabsTrigger>
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
              <AuthSection
                auth={requestObj.auth || {}}
                onSaveToDatabase={(updates) =>
                  updateRequest.mutateAsync({ ...requestObj, ...updates })
                }
              />
            </TabsContent>
            <TabsContent value="body">
              <BodySection
                body={requestObj.body || {}}
                onSaveToDatabase={(updates) =>
                  updateRequest.mutateAsync({ ...requestObj, ...updates })
                }
                onErrors={setHasErrors}
              />
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
        <div className="flex flex-col w-1/2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList>
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="request" className="h-full">
              <div className="h-full p-4"></div>
            </TabsContent>
            <TabsContent value="response" className="h-full">
              <div className="h-full p-4 overflow-auto my-scrollbar">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Sending request...</div>
                  </div>
                )}

                {error && !response && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                    <div className="text-sm text-destructive font-medium">Request Failed</div>
                    <div className="text-sm text-destructive/80 mt-1">{error}</div>
                  </div>
                )}

                {response && (
                  <>
                    <Collapsible
                      open={responseCollapsed}
                      onOpenChange={setResponseCollapsed}
                      className="mb-4"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-bg rounded-md hover:bg-muted/70 transition-colors">
                        <span className="text-sm font-medium">
                          HTTP/1.1{' '}
                          <span className={`font-bold ${getStatusColor(response.status)}`}>
                            {response.status}
                          </span>{' '}
                          <span className={getStatusColor(response.status)}>
                            {getStatusText(response.status, response.statusText)}
                          </span>{' '}
                          ({Object.keys(response.headers).length} headers)
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${responseCollapsed ? 'rotate-180' : ''}`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="overflow-x-auto max-w-full">
                          <Table className="w-full min-w-[400px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/3 min-w-[120px] whitespace-nowrap">
                                  Header
                                </TableHead>
                                <TableHead className="min-w-[200px]">Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(response.headers).map(([key, val]) => (
                                <TableRow key={key}>
                                  <TableCell className="font-medium break-words min-w-[120px] max-w-[200px] whitespace-normal align-top">
                                    {key}
                                  </TableCell>
                                  <TableCell className="table-cell-wrap min-w-[200px] whitespace-normal align-top">
                                    {String(val)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Response time: {response.responseTime}ms • Size: {response.size} bytes
                      </div>
                    </div>

                    <CodeMirrorResponse
                      language={
                        response.headers['content-type']?.includes('json')
                          ? 'json'
                          : response.headers['content-type']?.includes('xml')
                            ? 'xml'
                            : response.headers['content-type']?.includes('yaml') ||
                                response.headers['content-type']?.includes('yml')
                              ? 'yaml'
                              : 'javascript'
                      }
                      value={
                        typeof response.data === 'string'
                          ? response.data
                          : JSON.stringify(response.data, null, 2)
                      }
                    />
                  </>
                )}

                {!response && !isLoading && !error && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">
                      No response yet. Send a request to see the response here.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          {/* <div className="mb-4">
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
              <label className="block text-sm font-medium mb-1">Auth</label>
              <div className="text-xs text-muted-foreground">
                {JSON.stringify(requestObj.auth) || ""}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Query Parameters</label>
              <div className="text-xs text-muted-foreground">
                {Object.keys(requestObj.queryParams || {}).length} parameters
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default RequestTab
