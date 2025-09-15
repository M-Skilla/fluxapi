import React from 'react'
import { RequestTabContent } from '@/lib/types'
import RequestSelect from './request-select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Plus, Send, Trash } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface RequestTabProps {
  content: RequestTabContent
}

const RequestTab: React.FC<RequestTabProps> = ({ content }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [params, setParams] = React.useState([{ key: '', value: '' }])
  const [requestObj, setRequestObj] = React.useState({
    method: 'GET',
    url: '',
    headers: {},
    queryParams: params,
    body: '',
    auth: {
      type: 'none',
      data: {}
    }
  })

  

  const sendRequest = () => {
    setIsLoading(true)
    setTimeout(() => {
      console.log('Sending request...')
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full ">
      <div className="flex gap-3 items-center py-2 px-4 border-b bg-sidebar">
        <RequestSelect
          method={requestObj.method}
          setMethod={(method) => setRequestObj((prev) => ({ ...prev, method }))}
        />
        <Input
          value={requestObj.url}
          onChange={(e) => setRequestObj((prev) => ({ ...prev, url: e.target.value }))}
          className="flex-1"
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
              <div className="flex flex-col px-4 py-2 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-medium">Query Parameters</h2>
                  <Button size="sm" variant="ghost" className="text-primary">
                    <Plus className="h-4 w-4" />
                    <span>Add Params</span>
                  </Button>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {params.map((param, index) => (
                    <>
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Key"
                          value={param.key}
                          onChange={(e) => {
                            const newParams = [...params]
                            newParams[index].key = e.target.value
                            setParams(newParams)
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={param.value}
                          onChange={(e) => {
                            const newParams = [...params]
                            newParams[index].value = e.target.value
                            setParams(newParams)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && index === params.length - 1) {
                              setParams([...params, { key: '', value: '' }])
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setParams(params.filter((_, i) => i !== index))}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      {index === params.length - 1 && (
                        <Button
                          size="sm"
                          className="bg-transparent border border-primary hover:bg-input/30 cursor-pointer text-primary"
                          onClick={() => setParams([...params, { key: '', value: '' }])}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="headers">
              <div className="flex flex-col px-4 py-2 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-medium">Headers</h2>
                  <Button size="sm" variant="ghost" className="text-primary">
                    <Plus className="h-4 w-4" />
                    <span>Add Header</span>
                  </Button>
                </div>
              </div>
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
              {content.method} {content.url || <span className="text-muted">(no url)</span>}
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
              <div className="text-sm text-muted-foreground">{content.method}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <div className="text-sm text-muted-foreground">{content.url || 'No URL set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Headers</label>
              <div className="text-xs text-muted-foreground">
                {Object.keys(content.headers).length} headers
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Query Parameters</label>
              <div className="text-xs text-muted-foreground">
                {Object.keys(content.queryParams).length} parameters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestTab
