import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

import { UpdateRequestRequest } from '@/lib'
import BodyFile from './body-file'
import BodyText from './body-text'
import BodyForm from './body-form'

export type BodyType = 'text' | 'file' | 'form'

interface BodySectionProps {
  body: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
  onErrors?: (hasErrors: boolean) => void
}

const BodySection: React.FC<BodySectionProps> = ({ body, onSaveToDatabase, onErrors }) => {
  const [bodyType, setBodyType] = useState<BodyType>(body?.type || 'text')

  const handleBodyTypeChange = (value: BodyType) => {
    setBodyType(value)
    onSaveToDatabase({ body: { ...body, type: value } })
  }

  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-medium">Body</h2>
        <Select value={bodyType} onValueChange={handleBodyTypeChange}>
          <SelectTrigger className="w-[120px] h-[20px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-sidebar">
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="file">File</SelectItem>
            <SelectItem value="form">Form</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex-1">
        {bodyType === 'text' && (
          <BodyText body={body} onSaveToDatabase={onSaveToDatabase} onErrors={onErrors} />
        )}
        {bodyType === 'file' && (
          <BodyFile body={body} onSaveToDatabase={onSaveToDatabase} onErrors={onErrors} />
        )}
        {bodyType === 'form' && (
          <BodyForm body={body} onSaveToDatabase={onSaveToDatabase} onErrors={onErrors} />
        )}
      </div>
    </div>
  )
}

export default BodySection
