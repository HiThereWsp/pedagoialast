import { Card } from '@/components/ui/card'
import { ModificationForm } from './ModificationForm'
import { FeedbackButtons } from './FeedbackButtons'
import { DownloadButton } from './DownloadButton'

interface GeneratedImageProps {
  imageUrl: string
  onModify: (modificationPrompt: string) => void
  isLoading: boolean
}

export const GeneratedImage = ({ imageUrl, onModify, isLoading }: GeneratedImageProps) => {
  return (
    <div className="mt-6 space-y-4">
      <Card className="p-6">
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full h-auto rounded-lg shadow-lg mb-4"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FeedbackButtons imageUrl={imageUrl} />
            <DownloadButton imageUrl={imageUrl} />
          </div>
        </div>
      </Card>
      
      <ModificationForm 
        onSubmit={onModify}
        isLoading={isLoading}
      />
    </div>
  )
}