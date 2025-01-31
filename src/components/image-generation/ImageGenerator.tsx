import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/useImageGeneration'

export const ImageGenerator = () => {
  const { 
    isLoading, 
    generatedImageUrl, 
    generateImage, 
    modifyImage 
  } = useImageGeneration()

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <GenerationForm 
        onSubmit={generateImage}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="mt-4">
          <LoadingIndicator />
        </div>
      )}

      {generatedImageUrl && !isLoading && (
        <GeneratedImage
          imageUrl={generatedImageUrl}
          onModify={modifyImage}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}