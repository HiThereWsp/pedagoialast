import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { supabase } from '@/integrations/supabase/client'
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
      const { data: statusData, error: statusError } = await supabase.functions.invoke('generate-image', {
        body: { predictionId }
      })

      if (statusError) throw statusError

      if (statusData.status === 'succeeded' && statusData.output) {
        setGeneratedImageUrl(Array.isArray(statusData.output) ? statusData.output[0] : statusData.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'generate')
      } else if (statusData.status === 'failed') {
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

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: enhancedPrompt }
      })

      if (error) throw error

      if (data.predictionId) {
        setPredictionId(data.predictionId)
        checkPredictionStatus(data.predictionId)
      } else if (data.output) {
        setGeneratedImageUrl(Array.isArray(data.output) ? data.output[0] : data.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'generate')
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
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: modificationPrompt,
          image: generatedImageUrl
        }
      })

      if (error) throw error

      if (data.predictionId) {
        setPredictionId(data.predictionId)
        checkPredictionStatus(data.predictionId)
      } else if (data.output) {
        setGeneratedImageUrl(Array.isArray(data.output) ? data.output[0] : data.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'modify')
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