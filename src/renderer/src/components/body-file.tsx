import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Upload, X } from 'lucide-react'
import { UpdateRequestRequest } from '@/lib'

interface BodyFileProps {
  body: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
  onErrors?: (hasErrors: boolean) => void
}

const BodyFile: React.FC<BodyFileProps> = ({ body, onSaveToDatabase, onErrors }) => {
  // Since files don't have syntax errors, report no errors
  onErrors?.(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Convert file to base64 for storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        onSaveToDatabase({
          body: {
            ...body,
            type: 'file',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onSaveToDatabase({
      body: {
        ...body,
        type: 'file',
        fileName: null,
        fileType: null,
        fileSize: null,
        fileData: null
      }
    })
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">File Upload</span>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        {!selectedFile ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Choose File
          </Button>
        ) : (
          <div className="flex items-center justify-between p-2 border rounded-md bg-muted">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Select a file to upload as the request body. The file will be sent as binary data.
      </div>
    </div>
  )
}

export default BodyFile
