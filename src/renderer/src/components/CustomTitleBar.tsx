import React from 'react'
import Logo from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { Minus, Square, X } from 'lucide-react'

const CustomTitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electron.ipcRenderer.invoke('minimize-window')
  }

  const handleMaximize = () => {
    window.electron.ipcRenderer.invoke('maximize-window')
  }

  const handleClose = () => {
    window.electron.ipcRenderer.invoke('close-window')
  }

  return (
    <div
      className="w-full flex items-center justify-between h-8 bg-sidebar border-b border-border px-3 select-none flex-shrink-0 z-50"
      style={{ appRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <img src={Logo} className="h-5 w-7" alt="FluxAPI" />
        <h1 className="text-sm font-medium text-foreground">FluxAPI</h1>
      </div>
      <div className="flex items-center" style={{ appRegion: 'no-drag' } as React.CSSProperties}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="h-8 w-8 p-0 hover:bg-muted/50 rounded-none"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="h-8 w-8 p-0 hover:bg-muted/50 rounded-none"
        >
          <Square className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-none"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default CustomTitleBar
