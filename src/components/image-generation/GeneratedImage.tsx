
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { DownloadButton } from './DownloadButton'
import { FeedbackButtons } from './FeedbackButtons'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useAuth } from '@/hooks/useAuth'

interface GeneratedImageProps {
  imageUrl: string
  onRegenerate: () => void
  isLoading: boolean
  prompt?: string
}

export const GeneratedImage = ({ imageUrl, onRegenerate, isLoading, prompt }: GeneratedImageProps) => {
  const { toast } = useToast()
  const { saveImage } = useSavedContent()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  useEffect(() => {
    // Fonction de sauvegarde avec backoff exponentiel
    const saveGeneratedImage = async (retryCount = 0) => {
      // Ne pas tenter de sauvegarder si :
      // - Pas d'URL d'image
      // - Pas de prompt
      // - Utilisateur non connecté
      // - Déjà sauvegardé
      if (!imageUrl || !prompt || !user || hasSaved) return

      try {
        setIsSaving(true)
        
        // Effectuer la sauvegarde
        const result = await saveImage({
          prompt: prompt,
          image_url: imageUrl
        })
        
        if (result) {
          setHasSaved(true)
          toast({
            description: "Votre image a été sauvegardée automatiquement",
          })
        } else if (retryCount < 2) {
          // Retry avec délai exponentiel (500ms, puis 1500ms)
          const delay = Math.pow(3, retryCount) * 500
          console.log(`Nouvelle tentative de sauvegarde dans ${delay}ms (tentative ${retryCount + 1})`)
          setTimeout(() => saveGeneratedImage(retryCount + 1), delay)
        }
      } catch (error) {
        console.error('Error saving image:', error)
        
        // Ne pas afficher de toast lors des tentatives intermédiaires
        if (retryCount >= 2) {
          toast({
            variant: "destructive",
            description: "Une erreur est survenue lors de la sauvegarde automatique",
          })
        }
      } finally {
        setIsSaving(false)
      }
    }

    // Attendre un court instant avant de tenter la sauvegarde pour permettre à l'état d'auth de se stabiliser
    const timer = setTimeout(() => {
      saveGeneratedImage()
    }, 800)

    return () => {
      clearTimeout(timer)
    }
  }, [imageUrl, prompt, saveImage, toast, user, hasSaved])

  // Réinitialiser l'état de sauvegarde lorsque l'URL de l'image change
  useEffect(() => {
    setHasSaved(false)
  }, [imageUrl])

  return (
    <div className="mt-8 space-y-6">
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[512px] bg-muted/50 rounded-lg">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="space-y-4">
            {prompt && (
              <p className="text-sm text-muted-foreground">"{prompt}"</p>
            )}
            <img 
              src={imageUrl} 
              alt="Generated image" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary"
                onClick={onRegenerate}
                disabled={isLoading || isSaving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
              <DownloadButton imageUrl={imageUrl} />
              <FeedbackButtons imageUrl={imageUrl} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
