
import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useToolMetrics } from '@/hooks/useToolMetrics'
import { GenerationPrompt } from '@/components/image-generation/types'
import { useImageContent } from '@/hooks/content/useImageContent'

export const useImageGeneration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { logToolUsage } = useToolMetrics()
  const { saveImage } = useImageContent()
  const isGenerating = useRef(false)

  const generateImage = async (generationPrompt: GenerationPrompt) => {
    // Empêcher les générations multiples simultanées
    if (isGenerating.current) {
      console.log('Génération déjà en cours, ignorée')
      return
    }
    
    isGenerating.current = true
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

      // Créer d'abord l'enregistrement dans la base de données
      // Utiliser une sauvegarde silencieuse (sans affichage d'erreur) pour le statut "pending"
      await saveImage({
        prompt: generationPrompt.user_prompt
      })

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        }
      })

      if (error) throw error

      if (data?.output) {
        setGeneratedImageUrl(data.output)
        
        // La sauvegarde de l'URL est maintenant gérée par le composant GeneratedImage
        // pour éviter les problèmes de timing avec l'authentification
        
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
      // Garantir que le drapeau de génération est réinitialisé, même en cas d'erreur
      setTimeout(() => {
        isGenerating.current = false
      }, 500)
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
    generateImage
  }
}
