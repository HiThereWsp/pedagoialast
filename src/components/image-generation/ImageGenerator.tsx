
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/image-generation'
import { useState, useRef } from 'react'
import { ImageStyle, GenerationPrompt } from './types'
import { useToast } from '@/hooks/use-toast'

export const ImageGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')
  const [lastPrompt, setLastPrompt] = useState<GenerationPrompt | null>(null)
  const operationInProgress = useRef(false)
  const { toast } = useToast()
  
  const { 
    isLoading, 
    generatedImageUrl, 
    generateImage
  } = useImageGeneration()

  const handleGenerateImage = async (prompt: GenerationPrompt) => {
    // Éviter les opérations multiples
    if (operationInProgress.current) {
      toast({
        description: "Une génération est déjà en cours, veuillez patienter"
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

    try {
      operationInProgress.current = true
      setSelectedStyle(prompt.style)
      setLastPrompt(prompt)
      await generateImage(prompt)
    } finally {
      // Garantir que le drapeau est toujours réinitialisé
      setTimeout(() => {
        operationInProgress.current = false
      }, 500)
    }
  }

  const handleRegenerate = async () => {
    if (!lastPrompt || operationInProgress.current) return
    
    try {
      operationInProgress.current = true
      await generateImage(lastPrompt)
    } finally {
      setTimeout(() => {
        operationInProgress.current = false
      }, 500)
    }
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
          prompt={lastPrompt?.user_prompt}
        />
      )}
    </Card>
  )
}
