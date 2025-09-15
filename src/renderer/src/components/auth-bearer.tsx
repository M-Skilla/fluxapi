import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { UpdateRequestRequest } from '@/lib'

interface BearerAuthProps {
  auth: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
}

const BearerAuth: React.FC<BearerAuthProps> = ({ auth, onSaveToDatabase }) => {
  const [token, setToken] = useState(auth?.token || '')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    setToken(auth?.token || '')
  }, [auth?.token])

  const handleTokenChange = (value: string) => {
    setToken(value)
    onSaveToDatabase({ auth: { ...auth, type: 'bearer', token: value } })
  }

  const toggleShowToken = () => {
    setShowToken(!showToken)
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Bearer Token</label>
        <div className="relative">
          <Input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="Enter your bearer token..."
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={toggleShowToken}
            aria-label={showToken ? 'Hide token' : 'Show token'}
          >
            {showToken ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Enter your Bearer token for authentication. The token will be included in the Authorization
        header as "Bearer {'{token}'}".
      </div>
    </div>
  )
}

export default BearerAuth
