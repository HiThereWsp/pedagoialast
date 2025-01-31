import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { useState } from 'react'
import { ImageStyle } from './types'

export const ImageGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')
  const { 
    isLoading, 
    generatedImageUrl, 
    generateImage, 
    modifyImage 
  } = useImageGeneration()

  const handleGenerateImage = (prompt: { context: string, user_prompt: string, style: ImageStyle }) => {
    setSelectedStyle(prompt.style)
    generateImage(prompt)
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <GenerationForm 
        onSubmit={handleGenerateImage}
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
          onModify={(prompt) => modifyImage(prompt, selectedStyle)}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}