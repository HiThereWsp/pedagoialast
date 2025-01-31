import { ModificationForm } from './ModificationForm'

interface GeneratedImageProps {
  imageUrl: string
  onModify: (modificationPrompt: string) => void
  isLoading: boolean
}

export const GeneratedImage = ({ imageUrl, onModify, isLoading }: GeneratedImageProps) => {
  return (
    <div className="mt-6 space-y-4">
      <img
        src={imageUrl}
        alt="Generated"
        className="w-full h-auto rounded-lg shadow-lg"
      />
      
      <ModificationForm 
        onSubmit={onModify}
        isLoading={isLoading}
      />
    </div>
  )
}