import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { useToast } from '@/hooks/use-toast'
import { useToolMetrics } from '@/hooks/useToolMetrics'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { ImageStyle } from './types'

export const ImageGenerator = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { logToolUsage } = useToolMetrics()
  const [predictionId, setPredictionId] = useState<string | null>(null)

  const checkPredictionStatus = async (predictionId: string) => {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du statut')
      }

      const data = await response.json()

      if (data.status === 'succeeded' && data.output) {
        setGeneratedImageUrl(Array.isArray(data.output) ? data.output[0] : data.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'generate')
      } else if (data.status === 'failed') {
        throw new Error('La génération a échoué')
      } else {
        setTimeout(() => checkPredictionStatus(predictionId), 1000)
      }
    } catch (error) {
      console.error('Error checking prediction status:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification du statut de la génération"
      })
      setIsLoading(false)
    }
  }

  const handleGenerate = async (prompt: string, style: ImageStyle) => {
    setIsLoading(true)

    try {
      const enhancedPrompt = style === 'auto' 
        ? prompt 
        : `${prompt} (in ${style} style)`

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-schnell",
          input: {
            prompt: enhancedPrompt,
            go_fast: true,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80,
            num_inference_steps: 4
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération')
      }

      const data = await response.json()

      if (data.id) {
        setPredictionId(data.id)
        checkPredictionStatus(data.id)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'image"
      })
      setIsLoading(false)
    }
  }

  const handleModify = async (modificationPrompt: string) => {
    if (!generatedImageUrl) return
    
    setIsLoading(true)
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-schnell",
          input: {
            prompt: modificationPrompt,
            image: generatedImageUrl,
            go_fast: true,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80,
            num_inference_steps: 4
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification')
      }

      const data = await response.json()

      if (data.id) {
        setPredictionId(data.id)
        checkPredictionStatus(data.id)
      }
    } catch (error) {
      console.error('Error modifying image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'image"
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <GenerationForm 
        onSubmit={handleGenerate}
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
          onModify={handleModify}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}