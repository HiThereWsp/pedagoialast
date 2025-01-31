import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useState } from 'react'
import { ImageStyle, GenerationPrompt } from './types'
import { useToast } from '@/hooks/use-toast'

export const ImageGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')
  const [lastPrompt, setLastPrompt] = useState<GenerationPrompt | null>(null)
  const { toast } = useToast()
  
  const { isLimited, checkRateLimit } = useRateLimit({
    maxRequests: 5,
    timeWindow: 2592000000
  })

  const { 
    isLoading, 
    generatedImageUrl, 
    generateImage
  } = useImageGeneration()

  const handleGenerateImage = async (prompt: GenerationPrompt) => {
    if (isLimited) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de générations d'images pour ce mois-ci."
      })
      return
    }

    if (prompt.user_prompt.length < 3) {
      toast({
        variant: "destructive",
        description: "Veuillez entrer une description plus détaillée (minimum 3 caractères)"
      })
      return
    }

    if (prompt.user_prompt.length > 1000) {
      toast({
        variant: "destructive",
        description: "La description est trop longue (maximum 1000 caractères)"
      })
      return
    }

    const canProceed = await checkRateLimit()
    if (!canProceed) {
      return
    }

    setSelectedStyle(prompt.style)
    setLastPrompt(prompt)
    generateImage(prompt)
  }

  const handleRegenerate = async () => {
    if (!lastPrompt) return
    
    if (isLimited) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de générations d'images pour ce mois-ci."
      })
      return
    }

    const canProceed = await checkRateLimit()
    if (!canProceed) {
      return
    }

    generateImage(lastPrompt)
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
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}