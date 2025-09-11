import React from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Square, X } from 'lucide-react'

const CustomTitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.api.minimizeWindow()
  }

  const handleMaximize = () => {
    window.api.maximizeWindow()
  }

  const handleClose = () => {
    window.api.closeWindow()
  }

  return (
    <div
      id="title-bar"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-10 bg-background border-b px-4 select-none"
    >
      <div className="flex items-center">
        <h1 className="text-sm font-semibold">FluxAPI</h1>
      </div>
      <div className="flex items-center space-x-2 window-controls">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className="h-8 w-8 hover:bg-accent"
        >
          <Minus className="h-2 w-2" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMaximize}
          className="h-8 w-8 hover:bg-accent"
        >
          <Square className="h-2 w-2" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 hover:bg-red-500 hover:text-white"
        >
          <X className="h-2 w-2" />
        </Button>
      </div>
    </div>
  )
}

export default CustomTitleBar
