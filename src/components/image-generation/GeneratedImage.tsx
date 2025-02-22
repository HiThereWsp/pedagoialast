
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { DownloadButton } from './DownloadButton'
import { FeedbackButtons } from './FeedbackButtons'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSavedContent } from '@/hooks/useSavedContent'

interface GeneratedImageProps {
  imageUrl: string
  onRegenerate: () => void
  isLoading: boolean
  prompt?: string
}

export const GeneratedImage = ({ imageUrl, onRegenerate, isLoading, prompt }: GeneratedImageProps) => {
  const { toast } = useToast()
  const { saveImage } = useSavedContent()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const saveGeneratedImage = async () => {
      if (!imageUrl) return

      try {
        setIsSaving(true)
        await saveImage({
          title: `Image générée - ${new Date().toLocaleDateString()}`,
          prompt: prompt || 'Image générée',
          image_url: imageUrl
        })

        toast({
          description: "Votre image a été sauvegardée automatiquement",
        })
      } catch (error) {
        console.error('Error saving image:', error)
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de la sauvegarde automatique",
        })
      } finally {
        setIsSaving(false)
      }
    }

    saveGeneratedImage()
  }, [imageUrl, prompt])

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
                disabled={isLoading}
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
