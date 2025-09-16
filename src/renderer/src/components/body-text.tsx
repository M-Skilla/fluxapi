import { useState, useEffect, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { UpdateRequestRequest } from '@/lib'
import CodeMirrorEditor from './cm-editor'

export type ContentType = 'json' | 'yaml' | 'xml'

interface BodyTextProps {
  body: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
  onErrors?: (hasErrors: boolean) => void
}

const BodyText: React.FC<BodyTextProps> = ({ body, onSaveToDatabase, onErrors }) => {
  const [content, setContent] = useState(body?.content || '')
  const [contentType, setContentType] = useState<ContentType>(body?.contentType || 'json')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setContent(body?.content || '')
    setContentType(body?.contentType || 'json')
  }, [body?.content, body?.contentType])

  const handleContentChange = (value: string) => {
    setContent(value)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSaveToDatabase({
        body: {
          ...body,
          type: 'text',
          content: value,
          contentType
        }
      })
    }, 1000) // 1 second debounce
  }

  const handleContentTypeChange = (value: ContentType) => {
    setContentType(value)
    onSaveToDatabase({
      body: {
        ...body,
        type: 'text',
        content,
        contentType: value
      }
    })
  }

  const getPlaceholder = () => {
    switch (contentType) {
      case 'json':
        return '{\n  "key": "value"\n}'
      case 'yaml':
        return 'key: value\nnested:\n  key: value'
      case 'xml':
        return '<root>\n  <element>value</element>\n</root>'
      default:
        return 'Enter request body...'
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Content Type</span>
        <Select value={contentType} disabled onValueChange={handleContentTypeChange}>
          <SelectTrigger className="w-[100px] h-[20px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-sidebar">
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CodeMirrorEditor
        value={content}
        onChange={handleContentChange}
        onErrors={(diagnostics) => onErrors?.(diagnostics.length > 0)}
        language={contentType}
      />
    </div>
  )
}

export default BodyText
