import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, X } from 'lucide-react'
import { UpdateRequestRequest } from '@/lib'

interface FormField {
  key: string
  value: string
  type: 'text' | 'file'
}

interface BodyFormProps {
  body: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
  onErrors?: (hasErrors: boolean) => void
}

const BodyForm: React.FC<BodyFormProps> = ({ body, onSaveToDatabase, onErrors }) => {
  // Since form data doesn't have syntax errors, report no errors
  onErrors?.(false)

  const [fields, setFields] = useState<FormField[]>(
    body?.fields || [{ key: '', value: '', type: 'text' }]
  )

  useEffect(() => {
    const defaultFields: FormField[] = [{ key: '', value: '', type: 'text' }]
    const bodyFields = body?.fields
    if (bodyFields && Array.isArray(bodyFields)) {
      const validatedFields: FormField[] = bodyFields.map((field) => ({
        key: field.key || '',
        value: field.value || '',
        type: field.type === 'text' || field.type === 'file' ? field.type : 'text'
      }))
      setFields(validatedFields)
    } else {
      setFields(defaultFields)
    }
  }, [body?.fields])

  const handleFieldChange = (index: number, field: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...field } as FormField
    setFields(newFields)
    onSaveToDatabase({
      body: {
        ...body,
        type: 'form',
        fields: newFields
      }
    })
  }

  const handleAddField = () => {
    const newFields: FormField[] = [...fields, { key: '', value: '', type: 'text' }]
    setFields(newFields)
    onSaveToDatabase({
      body: {
        ...body,
        type: 'form',
        fields: newFields
      }
    })
  }

  const handleRemoveField = (index: number) => {
    const newFields: FormField[] = fields.filter((_, i) => i !== index)
    setFields(newFields)
    onSaveToDatabase({
      body: {
        ...body,
        type: 'form',
        fields: newFields
      }
    })
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Form Data</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddField}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Field
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Key"
              value={field.key}
              onChange={(e) => handleFieldChange(index, { key: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={field.value}
              onChange={(e) => handleFieldChange(index, { value: e.target.value })}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveField(index)}
              className="h-8 w-8 p-0"
              disabled={fields.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Add key-value pairs for form data. These will be sent as multipart/form-data.
      </div>
    </div>
  )
}

export default BodyForm
