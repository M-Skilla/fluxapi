import React from 'react'
import { RequestTabContent } from '@/lib/types'
import RequestSelect from './request-select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
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
import { useTabsStore } from '@/lib/tabs-store'

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
  // All hooks must be called before any conditional returns
  const [requestObj, setRequestObj] = React.useState<UpdateRequestRequest>({
    id: content.id!,
    method: content.method || 'GET',
    url: content.url || '',
    headers: content.headers || {},
    queryParams: content.queryParams || {},
    auth: content.auth || {},
    body: content.body || "{ type: 'none' }"
  })

  const [hasErrors, setHasErrors] = React.useState(false)
  const [requestName, setRequestName] = React.useState('')
  const [responseCollapsed, setResponseCollapsed] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('request')
  const [leftTabValue, setLeftTabValue] = React.useState('params')
  const hasInitialized = React.useRef(false)

  // Fetch fresh data from database on mount
  const { data: dbRequest, isLoading: isDbLoading } = useRequest(content.id!)
  const { closeTab } = useTabsStore()
  const updateRequest = useUpdateRequest()

  // Response store
  const { response, isLoading: isRequestLoading, error, sendRequest } = useResponseStore()

  // Check if request exists in database, close tab if not
  React.useEffect(() => {
    if (!isDbLoading && !dbRequest && content.id) {
      console.warn(`Request with ID ${content.id} not found in database. Closing tab.`)
      // Use setTimeout to avoid immediate closure during initial render
      const timeoutId = setTimeout(() => {
        closeTab(content.id!.toString())
      }, 100)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [dbRequest, isDbLoading, content.id, closeTab])

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

  // Update local state when database data changes - only on initial load
  React.useEffect(() => {
    if (dbRequest && !isDbLoading && !hasInitialized.current) {
      const parsedBody = dbRequest.body
        ? typeof dbRequest.body === 'string'
          ? JSON.parse(dbRequest.body)
          : dbRequest.body
        : { type: 'none' }

      setRequestObj({
        id: dbRequest.id,
        method: dbRequest.method,
        url: dbRequest.url,
        headers: dbRequest.headers ? JSON.parse(dbRequest.headers) : {},
        queryParams: dbRequest.queryParams ? JSON.parse(dbRequest.queryParams) : {},
        auth: dbRequest.auth ? JSON.parse(dbRequest.auth) : {},
        body: parsedBody
      })

      setRequestName(dbRequest.name || 'Untitled')
      hasInitialized.current = true
    }
  }, [dbRequest, isDbLoading])

  // Update only body when database body changes (after initial load)
  React.useEffect(() => {
    if (dbRequest && !isDbLoading && hasInitialized.current) {
      const parsedBody = dbRequest.body
        ? typeof dbRequest.body === 'string'
          ? JSON.parse(dbRequest.body)
          : dbRequest.body
        : { type: 'none' }

      setRequestObj((prev) => ({
        ...prev,
        body: parsedBody
      }))

      setRequestName(dbRequest.name || 'Untitled')
    }
  }, [dbRequest?.body, isDbLoading])

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
    updateRequestDebounced({ url: newUrl, name: requestName })
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
      setActiveTab('response')

      await sendRequest({
        method: requestObj.method!,
        url: requestObj.url,
        headers: requestObj.headers || {},
        data: requestData,
        params: requestObj.queryParams || {}
      })

      // Switch to response tab when request completes
    } catch (error) {
      console.error('Request failed:', error)
      setActiveTab('response') // Still switch to response tab to show error
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Show loading state while checking database */}
      {isDbLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
            Loading request...
          </div>
        </div>
      )}

      {/* Don't render if request doesn't exist and we're not loading */}
      {!isDbLoading && !dbRequest && content.id && (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
            Request not found. Closing tab...
          </div>
        </div>
      )}

      {/* Main content - only show if not loading and request exists */}
      {!isDbLoading && (dbRequest || !content.id) && (
        <>
          {/* Header section - fixed height */}
          <div className="flex gap-3 items-center py-2 px-4 border-b bg-sidebar flex-shrink-0">
            <RequestSelect
              method={requestObj.method!}
              setMethod={(method) => {
                setRequestObj((prev) => ({ ...prev, method }))
                if (content.id) {
                  debounce(() => {
                    updateRequest.mutateAsync({ ...requestObj, method, name: requestName })
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
              disabled={hasErrors || isRequestLoading || !requestObj.url}
            >
              <Send className="h-4 w-4" />
              <span>{isRequestLoading ? 'Sending...' : 'Send'}</span>
            </Button>
          </div>

          {/* Main content area - takes remaining height */}
          <div className="flex flex-1 min-h-0">
            {/* Left side - Request configuration */}
            <div className="flex flex-col w-1/2 border-r h-full">
              <Tabs
                value={leftTabValue}
                onValueChange={setLeftTabValue}
                className="h-full flex flex-col"
              >
                {/* Desktop tabs - hidden on mobile */}
                <TabsList className="flex-shrink-0 hidden lg:flex">
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

                {/* Mobile dropdown - visible on mobile only */}
                <div className="flex-shrink-0 lg:hidden p-2">
                  <Select value={leftTabValue} onValueChange={setLeftTabValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="params">
                        Params
                        {Object.keys(requestObj.queryParams || {}).length > 0 &&
                          ` (${Object.keys(requestObj.queryParams || {}).length})`}
                      </SelectItem>
                      <SelectItem value="headers">
                        Headers
                        {Object.keys(requestObj.headers || {}).length > 0 &&
                          ` (${Object.keys(requestObj.headers || {}).length})`}
                      </SelectItem>
                      <SelectItem value="auth">
                        Auth{requestObj.auth && requestObj.auth?.type !== 'no-auth' ? ' •' : ''}
                      </SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                      <SelectItem value="exports">Exports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-h-0">
                  <TabsContent value="params" className="h-full m-0">
                    <ParamsSection
                      queryParams={requestObj.queryParams || {}}
                      onParamsChange={(params) =>
                        setRequestObj((prev) => ({ ...prev, queryParams: params }))
                      }
                      onSaveToDatabase={(updates) =>
                        updateRequest.mutateAsync({ ...requestObj, ...updates, name: requestName })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="headers" className="h-full m-0">
                    <HeadersSection
                      headers={requestObj.headers || {}}
                      onHeadersChange={(headers) => setRequestObj((prev) => ({ ...prev, headers }))}
                      onSaveToDatabase={(updates) =>
                        updateRequest.mutateAsync({ ...requestObj, ...updates, name: requestName })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="auth" className="h-full m-0">
                    <AuthSection
                      auth={requestObj.auth || {}}
                      onSaveToDatabase={(updates) =>
                        updateRequest.mutateAsync({ ...requestObj, ...updates, name: requestName })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="body" className="h-full m-0">
                    <BodySection
                      body={requestObj.body || {}}
                      onSaveToDatabase={(updates) =>
                        updateRequest.mutateAsync({ ...requestObj, ...updates, name: requestName })
                      }
                      onErrors={setHasErrors}
                    />
                  </TabsContent>
                  <TabsContent value="exports" className="h-full m-0">
                    <div className="flex flex-col p-4 h-full overflow-auto">
                      <div className="flex justify-between items-center">
                        <h2 className="text-md font-medium">Exports</h2>
                        <Button size="sm" variant="outline">
                          Add Export
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right side - Request/Response viewer */}
            <div className="flex flex-col w-1/2 h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Desktop tabs - hidden on mobile */}
                <TabsList className="flex-shrink-0 hidden lg:flex">
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">
                    Response{' '}
                    {response ? <div className="bg-primary w-2 h-2 rounded-full"></div> : <></>}
                  </TabsTrigger>
                </TabsList>

                {/* Mobile dropdown - visible on mobile only */}
                <div className="flex-shrink-0 lg:hidden p-2">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="request">Request</SelectItem>
                      <SelectItem value="response">Response{response ? ' •' : ''}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-h-0">
                  <TabsContent value="request" className="h-full m-0 flex flex-col">
                    <div className="flex-1 flex flex-col overflow-auto p-4">
                      {requestObj.url && (
                        <>
                          <div className="flex-shrink-0 space-y-4 mb-4">
                            <Collapsible
                              open={responseCollapsed}
                              onOpenChange={setResponseCollapsed}
                            >
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-bg rounded-md hover:bg-muted/70 transition-colors">
                                <span className="text-sm font-medium">
                                  {requestObj.method} {requestObj.url}
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
                                      {Object.entries(requestObj.headers || {}).map(
                                        ([key, val]) => (
                                          <TableRow key={key}>
                                            <TableCell className="font-medium break-words min-w-[120px] max-w-[200px] whitespace-normal align-top">
                                              {key}
                                            </TableCell>
                                            <TableCell className="table-cell-wrap min-w-[200px] whitespace-normal align-top">
                                              {String(val)}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                      {(!requestObj.headers ||
                                        Object.keys(requestObj.headers).length === 0) && (
                                        <TableRow>
                                          <TableCell
                                            colSpan={2}
                                            className="text-center text-muted-foreground py-4"
                                          >
                                            No headers sent
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>

                            <div className="text-xs text-muted-foreground">
                              HTTP/1.1 • {Object.keys(requestObj.headers || {}).length} headers
                            </div>
                          </div>

                          {requestObj.body &&
                            typeof requestObj.body === 'object' &&
                            (requestObj.body as any).content && (
                              <div className="flex-1 flex flex-col min-h-0">
                                <div className="text-xs text-muted-foreground mb-2 flex-shrink-0">
                                  Request Body
                                </div>
                                <div className="flex-1 min-h-0 overflow-hidden">
                                  <CodeMirrorResponse
                                    language={
                                      (requestObj.body as any).contentType === 'json'
                                        ? 'json'
                                        : 'javascript'
                                    }
                                    value={(requestObj.body as any).content}
                                  />
                                </div>
                              </div>
                            )}
                        </>
                      )}

                      {!requestObj.url && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">
                            Enter a URL to see request details
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="response" className="h-full m-0 flex flex-col">
                    <div className="flex-1 flex flex-col overflow-auto p-4">
                      {isRequestLoading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Sending request...</div>
                        </div>
                      )}

                      {error && !response && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md mb-4 flex-shrink-0">
                          <div className="text-sm text-destructive font-medium">Request Failed</div>
                          <div className="text-sm text-destructive/80 mt-1">{error}</div>
                        </div>
                      )}

                      {response && (
                        <>
                          <div className="flex-shrink-0 space-y-4">
                            <Collapsible
                              open={responseCollapsed}
                              onOpenChange={setResponseCollapsed}
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

                            <div className="text-xs text-muted-foreground">
                              Response time: {response.responseTime}ms • Size: {response.size} bytes
                            </div>
                          </div>

                          <div className="flex-1 min-h-0 overflow-hidden mb-5">
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
                          </div>
                        </>
                      )}

                      {!response && !isRequestLoading && !error && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">
                            No response yet. Send a request to see the response here.
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RequestTab
