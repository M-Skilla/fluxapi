import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X } from 'lucide-react'

interface CollectionNameInputProps {
  onSave: (name: string) => void
  onCancel: () => void
  placeholder?: string
}

export const CollectionNameInput: React.FC<CollectionNameInputProps> = ({
  onSave,
  onCancel,
  placeholder = 'Enter collection name...'
}) => {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when component mounts
    inputRef.current?.focus()
  }, [])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (trimmedName) {
      onSave(trimmedName)
    } else {
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 text-sm"
        autoFocus
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        className="h-8 w-8 p-0"
        disabled={!name.trim()}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 w-8 p-0">
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}
