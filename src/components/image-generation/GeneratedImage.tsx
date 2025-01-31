import { Button } from '@/components/ui/button'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { ModificationForm } from './ModificationForm'
import { DownloadButton } from './DownloadButton'
import { FeedbackButtons } from './FeedbackButtons'

interface GeneratedImageProps {
  imageUrl: string
  onModify: (prompt: string) => void
  isLoading: boolean
}

export const GeneratedImage = ({ imageUrl, onModify, isLoading }: GeneratedImageProps) => {
  return (
    <div className="mt-8 space-y-6">
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[512px] bg-muted/50 rounded-lg">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="space-y-4">
            <img 
              src={imageUrl} 
              alt="Generated image" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="flex flex-wrap gap-2">
              <DownloadButton imageUrl={imageUrl} />
              <FeedbackButtons />
            </div>
            <ModificationForm onSubmit={onModify} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  )
}