import { UpdateRequestRequest } from "@/lib"
import { Button } from "./ui/button"
import { Plus, Trash } from "lucide-react"
import { Input } from "./ui/input"

interface HeadersSectionProps {
  headers: Record<string, string>
  onHeadersChange: (headers: Record<string, string>) => void
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
}

const HeadersSection: React.FC<HeadersSectionProps> = ({
  headers,
  onHeadersChange,
  onSaveToDatabase
}) => {
  const handleAddHeader = () => {
    const newHeaders = { ...headers, '': '' }
    onHeadersChange(newHeaders)
    onSaveToDatabase({ headers: newHeaders })
  }

  const handleHeaderKeyChange = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[oldKey]
    if (newKey) {
      newHeaders[newKey] = value
    }
    onHeadersChange(newHeaders)
    onSaveToDatabase({ headers: newHeaders })
  }

  const handleHeaderValueChange = (key: string, value: string) => {
    const newHeaders = { ...headers }
    newHeaders[key] = value
    onHeadersChange(newHeaders)
    onSaveToDatabase({ headers: newHeaders })
  }

  const handleDeleteHeader = (key: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[key]
    onHeadersChange(newHeaders)
    onSaveToDatabase({ headers: newHeaders })
  }

  const handleTabPress = (index: number) => {
    if (index === Object.keys(headers).length - 1) {
      const newHeaders = { ...headers, '': '' }
      onHeadersChange(newHeaders)
    }
  }

  return (
    <div className="flex flex-col px-4 py-2 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-medium">Headers</h2>
        <Button size="sm" variant="ghost" className="text-primary" onClick={handleAddHeader}>
          <Plus className="h-4 w-4" />
          <span>Add Header</span>
        </Button>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {Object.entries(headers).map(([key, value], index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Key"
              value={key}
              onChange={(e) => handleHeaderKeyChange(key, e.target.value, value)}
            />
            <Input
              placeholder="Value"
              value={value}
              onChange={(e) => handleHeaderValueChange(key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  handleTabPress(index)
                }
              }}
            />
            <Button size="sm" variant="ghost" onClick={() => handleDeleteHeader(key)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeadersSection;