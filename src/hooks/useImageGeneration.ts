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

  const updateMonthlyUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    const { data, error } = await supabase
      .from('image_generation_usage')
      .upsert({
        user_id: user.id,
        generation_month: currentMonth,
        monthly_generation_count: 1
      }, {
        onConflict: 'user_id, generation_month',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating usage:', error);
    }
  };

  const generateImage = async (generationPrompt: GenerationPrompt) => {
    const startTime = Date.now()
    setIsLoading(true)

    try {
      const enhancedPrompt = generationPrompt.style === 'auto' 
        ? `${generationPrompt.context} ${generationPrompt.user_prompt}`
        : `${generationPrompt.context} ${generationPrompt.user_prompt} (in ${generationPrompt.style} style)`

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
        await updateMonthlyUsage()
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

  const modifyImage = async (modificationPrompt: string, style: ImageStyle) => {
    if (!generatedImageUrl) return
    
    const startTime = Date.now()
    setIsLoading(true)
    try {
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
        await updateMonthlyUsage()
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

  return {
    isLoading,
    generatedImageUrl,
    generateImage,
    modifyImage
  }
}