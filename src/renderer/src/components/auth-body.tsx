import BearerAuth from './auth-bearer'
import NoAuth from './auth-no'
import { AuthType } from './auth-section'
import { UpdateRequestRequest } from '@/lib'

interface AuthBodyProps {
  type: AuthType
  auth: any
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
}

const AuthBody: React.FC<AuthBodyProps> = ({ type, auth, onSaveToDatabase }) => {
  switch (type) {
    case 'no-auth':
      return <NoAuth />
    case 'basic':
      return <div>Basic Auth</div>
    case 'bearer':
      return <BearerAuth auth={auth} onSaveToDatabase={onSaveToDatabase} />
    case 'token':
      return <div>Token Auth</div>
    default:
      return <NoAuth />
  }
}

export default AuthBody
