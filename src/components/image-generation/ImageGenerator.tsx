import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useState } from 'react'
import { ImageStyle } from './types'
import { useToast } from '@/hooks/use-toast'

export const ImageGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')
  const { toast } = useToast()
  
  const { isLimited, checkRateLimit } = useRateLimit({
    maxRequests: 5, // 5 générations par mois
    timeWindow: 2592000000 // 30 jours en millisecondes
  })

  const { 
    isLoading, 
    generatedImageUrl, 
    generateImage, 
    modifyImage 
  } = useImageGeneration()

  const handleGenerateImage = async (prompt: { context: string, user_prompt: string, style: ImageStyle }) => {
    // Vérification du rate limit
    if (isLimited) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de générations d'images pour ce mois-ci."
      })
      return
    }

    // Validation de la longueur du prompt
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

    // Vérification du rate limit avant génération
    const canProceed = await checkRateLimit()
    if (!canProceed) {
      return
    }

    setSelectedStyle(prompt.style)
    generateImage(prompt)
  }

  const handleModifyImage = async (prompt: string) => {
    // Vérification du rate limit
    if (isLimited) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de modifications d'images pour ce mois-ci."
      })
      return
    }

    // Validation de la longueur du prompt
    if (prompt.length < 3) {
      toast({
        variant: "destructive",
        description: "Veuillez entrer une description plus détaillée (minimum 3 caractères)"
      })
      return
    }

    if (prompt.length > 1000) {
      toast({
        variant: "destructive",
        description: "La description est trop longue (maximum 1000 caractères)"
      })
      return
    }

    // Vérification du rate limit avant modification
    const canProceed = await checkRateLimit()
    if (!canProceed) {
      return
    }

    modifyImage(prompt, selectedStyle)
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
          onModify={handleModifyImage}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}