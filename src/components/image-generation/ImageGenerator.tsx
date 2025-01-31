import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { useToast } from '@/hooks/use-toast'
import { useToolMetrics } from '@/hooks/useToolMetrics'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { ImageStyle } from './types'
import { supabase } from '@/integrations/supabase/client'

export const ImageGenerator = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { logToolUsage } = useToolMetrics()

  const handleGenerate = async (prompt: string, style: ImageStyle) => {
    setIsLoading(true)

    try {
      const enhancedPrompt = style === 'auto' 
        ? prompt 
        : `${prompt} (in ${style} style)`

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        }
      })

      if (error) throw error

      if (data.output) {
        setGeneratedImageUrl(data.output)
        await logToolUsage('image_generation', 'generate')
      } else {
        throw new Error('Pas d\'URL d\'image dans la réponse')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération de l'image"
      })
    } finally {
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
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        }
      })

      if (error) throw error

      if (data.output) {
        setGeneratedImageUrl(data.output)
        await logToolUsage('image_generation', 'modify')
      } else {
        throw new Error('Pas d\'URL d\'image dans la réponse')
      }
    } catch (error) {
      console.error('Error modifying image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification de l'image"
      })
    } finally {
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