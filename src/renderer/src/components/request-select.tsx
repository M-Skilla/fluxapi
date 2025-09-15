import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface RequestSelectProps {
    method: string;
    setMethod: (method: string) => void;
}

const RequestSelect = ({ method, setMethod }: RequestSelectProps) => {

  const methodColors: Record<string, string> = {
    GET: 'text-green-600',
    POST: 'text-blue-600',
    PUT: 'text-yellow-600',
    DELETE: 'text-red-600',
    PATCH: 'text-purple-600',
    HEAD: 'text-gray-600',
    OPTIONS: 'text-indigo-600'
  }
  return (
    <Select value={method} onValueChange={setMethod}>
      <SelectTrigger className={` w-[105px] ${methodColors[method] || ''}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(methodColors).map((m) => (
          <SelectItem key={m} value={m} className={methodColors[m]}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default RequestSelect
