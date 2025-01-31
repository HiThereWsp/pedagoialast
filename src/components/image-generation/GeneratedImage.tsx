import { ModificationForm } from './ModificationForm'
import { DownloadButton } from './DownloadButton'
import { FeedbackButtons } from './FeedbackButtons'
import { ImageStyle } from './types'

interface GeneratedImageProps {
  imageUrl: string
  onModify: (modificationPrompt: string) => void
  isLoading: boolean
}

export const GeneratedImage = ({ imageUrl, onModify, isLoading }: GeneratedImageProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="relative aspect-square">
        <img
          src={imageUrl}
          alt="Generated image"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex justify-between items-center">
        <FeedbackButtons imageUrl={imageUrl} />
        <DownloadButton imageUrl={imageUrl} />
      </div>

      <ModificationForm
        onSubmit={onModify}
        isLoading={isLoading}
      />
    </div>
  )
}