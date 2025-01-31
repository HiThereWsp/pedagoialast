import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useToolMetrics } from '@/hooks/useToolMetrics'
import { GenerationPrompt, ImageStyle } from '@/components/image-generation/types'

export const useImageGeneration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { logToolUsage } = useToolMetrics()

  const generateImage = async (generationPrompt: GenerationPrompt) => {
    const startTime = Date.now()
    setIsLoading(true)

    try {
      const enhancedPrompt = generationPrompt.style === 'auto' 
        ? `${generationPrompt.context} ${generationPrompt.user_prompt}`
        : `${generationPrompt.context} ${generationPrompt.user_prompt} (in ${generationPrompt.style} style)`

      // Vérification du contenu inapproprié
      if (containsInappropriateContent(enhancedPrompt)) {
        throw new Error('Le contenu de votre prompt ne respecte pas nos conditions d\'utilisation')
      }

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
        
        // Enregistrement de l'utilisation
        const { error: usageError } = await supabase
          .from('image_generation_usage')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            prompt: generationPrompt.user_prompt,
            image_url: data.output
          })

        if (usageError) {
          console.error('Error logging usage:', usageError)
        }

        await logToolUsage(
          'image_generation',
          'generate',
          generationPrompt.user_prompt.length,
          Date.now() - startTime
        )

        toast({
          title: "Image générée avec succès",
          description: "Votre image a été créée avec succès.",
        })
      } else {
        throw new Error('Pas d\'URL d\'image dans la réponse')
      }
    } catch (error: any) {
      console.error('Error generating image:', error)
      
      // Messages d'erreur plus descriptifs
      let errorMessage = 'Une erreur est survenue lors de la génération de l\'image'
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Le service de génération d\'images ne répond pas. Veuillez réessayer dans quelques instants.'
      } else if (error.message.includes('quota')) {
        errorMessage = 'Vous avez atteint votre limite de générations d\'images pour ce mois-ci.'
      } else if (error.message.includes('inappropriate')) {
        errorMessage = 'Le contenu demandé ne respecte pas nos conditions d\'utilisation.'
      }

      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const modifyImage = async (modificationPrompt: string, style: ImageStyle) => {
    if (!generatedImageUrl) return
    
    const startTime = Date.now()
    setIsLoading(true)

    try {
      // Vérification du contenu inapproprié
      if (containsInappropriateContent(modificationPrompt)) {
        throw new Error('Le contenu de votre modification ne respecte pas nos conditions d\'utilisation')
      }

      const enhancedPrompt = style === 'auto' 
        ? modificationPrompt
        : `${modificationPrompt} (in ${style} style)`

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          originalImageUrl: generatedImageUrl,
          size: "1024x1024"
        }
      })

      if (error) throw error

      if (data.output) {
        setGeneratedImageUrl(data.output)
        
        // Enregistrement de l'utilisation
        const { error: usageError } = await supabase
          .from('image_generation_usage')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            prompt: modificationPrompt,
            image_url: data.output
          })

        if (usageError) {
          console.error('Error logging usage:', usageError)
        }

        await logToolUsage(
          'image_generation',
          'modify',
          modificationPrompt.length,
          Date.now() - startTime
        )

        toast({
          title: "Image modifiée avec succès",
          description: "Votre image a été modifiée avec succès.",
        })
      } else {
        throw new Error('Pas d\'URL d\'image dans la réponse')
      }
    } catch (error: any) {
      console.error('Error modifying image:', error)
      
      let errorMessage = 'Une erreur est survenue lors de la modification de l\'image'
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Le service de modification d\'images ne répond pas. Veuillez réessayer dans quelques instants.'
      } else if (error.message.includes('quota')) {
        errorMessage = 'Vous avez atteint votre limite de modifications d\'images pour ce mois-ci.'
      } else if (error.message.includes('inappropriate')) {
        errorMessage = 'Le contenu demandé ne respecte pas nos conditions d\'utilisation.'
      }

      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction utilitaire pour vérifier le contenu inapproprié
  const containsInappropriateContent = (text: string): boolean => {
    const inappropriateWords = [
      'nude', 'naked', 'porn', 'sex', 'violence', 'gore', 'blood',
      'death', 'kill', 'weapon', 'drug', 'cocaine', 'heroin'
    ]
    
    return inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    )
  }

  return {
    isLoading,
    generatedImageUrl,
    generateImage,
    modifyImage
  }
}