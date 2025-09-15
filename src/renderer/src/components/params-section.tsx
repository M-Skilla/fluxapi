import { UpdateRequestRequest } from "@/lib"
import { Button } from "./ui/button"
import { Plus, Trash } from "lucide-react"
import { Input } from "./ui/input"

interface ParamsSectionProps {
  queryParams: Record<string, string>
  onParamsChange: (params: Record<string, string>) => void
  onSaveToDatabase: (updates: Partial<UpdateRequestRequest>) => void
}

const ParamsSection: React.FC<ParamsSectionProps> = ({
  queryParams,
  onParamsChange,
  onSaveToDatabase
}) => {
  const handleAddParam = () => {
    const newParams = { ...queryParams, '': '' }
    onParamsChange(newParams)
    onSaveToDatabase({ queryParams: newParams })
  }

  const handleParamKeyChange = (oldKey: string, newKey: string, value: string) => {
    const newParams = { ...queryParams }
    delete newParams[oldKey]
    if (newKey) {
      newParams[newKey] = value
    }
    onParamsChange(newParams)
    onSaveToDatabase({ queryParams: newParams })
  }

  const handleParamValueChange = (key: string, value: string) => {
    const newParams = { ...queryParams }
    newParams[key] = value
    onParamsChange(newParams)
    onSaveToDatabase({ queryParams: newParams })
  }

  const handleDeleteParam = (key: string) => {
    const newParams = { ...queryParams }
    delete newParams[key]
    onParamsChange(newParams)
    onSaveToDatabase({ queryParams: newParams })
  }

  const handleTabPress = (index: number) => {
    if (index === Object.keys(queryParams).length - 1) {
      const newParams = { ...queryParams, '': '' }
      onParamsChange(newParams)
    }
  }

  return (
    <div className="flex flex-col px-4 py-2 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-medium">Query Parameters</h2>
        <Button size="sm" variant="ghost" className="text-primary" onClick={handleAddParam}>
          <Plus className="h-4 w-4" />
          <span>Add Params</span>
        </Button>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {Object.entries(queryParams).map(([key, value], index) => (
          <>
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Key"
                value={key}
                onChange={(e) => handleParamKeyChange(key, e.target.value, value)}
              />
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => handleParamValueChange(key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    handleTabPress(index)
                  }
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => handleDeleteParam(key)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {/* {index === Object.keys(queryParams).length - 1 && (
              <Button
                size="sm"
                className="bg-transparent border border-primary hover:bg-input/30 cursor-pointer text-primary"
                onClick={handleAddParam}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )} */}
          </>
        ))}
      </div>
    </div>
  )
}


export default ParamsSection;