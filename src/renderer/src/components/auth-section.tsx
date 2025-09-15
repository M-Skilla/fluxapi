import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import AuthBody from './auth-body'
import { UpdateRequestRequest } from '@/lib'

export type AuthType = 'no-auth' | 'basic' | 'bearer' | 'token'

interface AuthSectionProps {
  auth: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
}

const AuthSection: React.FC<AuthSectionProps> = ({ auth, onSaveToDatabase }) => {
  const [authType, setAuthType] = useState<AuthType>(auth?.type || 'no-auth')

  const handleAuthTypeChange = (value: AuthType) => {
    setAuthType(value)
    onSaveToDatabase({ auth: { ...auth, type: value } })
  }

  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-medium">Auth</h2>
        <Select value={authType} onValueChange={handleAuthTypeChange}>
          <SelectTrigger className="w-[120px] h-[20px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-sidebar">
            <SelectItem value="no-auth">No Auth</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="bearer">Bearer</SelectItem>
            <SelectItem value="token">Auth Token</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <AuthBody type={authType} auth={auth} onSaveToDatabase={onSaveToDatabase} />
    </div>
  )
}

export default AuthSection
