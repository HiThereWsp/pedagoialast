import { Button } from '@/components/ui/button'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { DownloadButton } from './DownloadButton'
import { FeedbackButtons } from './FeedbackButtons'
import { RefreshCw } from 'lucide-react'

interface GeneratedImageProps {
  imageUrl: string
  onRegenerate: () => void
  isLoading: boolean
}

export const GeneratedImage = ({ imageUrl, onRegenerate, isLoading }: GeneratedImageProps) => {
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
              <Button 
                variant="secondary"
                onClick={onRegenerate}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
              <DownloadButton imageUrl={imageUrl} />
              <FeedbackButtons imageUrl={imageUrl} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}