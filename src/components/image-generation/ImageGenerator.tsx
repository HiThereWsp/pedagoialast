
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { GenerationForm } from './GenerationForm'
import { GeneratedImage } from './GeneratedImage'
import { useImageGeneration } from '@/hooks/image-generation/useImageGeneration'
import { useState, useEffect } from 'react'
import { GenerationPrompt } from '@/hooks/image-generation/types'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'

export const ImageGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>('auto')
  const { toast } = useToast()
  
  const { 
    isLoading, 
    isError,
    isSuccess,
    isInitialized,
    error,
    generatedImageUrl, 
    lastPrompt,
    generateImage,
    retryGeneration
  } = useImageGeneration()

  // Restaurer le style sélectionné depuis le dernier prompt
  useEffect(() => {
    if (lastPrompt?.style) {
      setSelectedStyle(lastPrompt.style);
    }
  }, [lastPrompt]);

  const handleGenerateImage = async (prompt: GenerationPrompt) => {
    // Le hook gère maintenant toute la logique de validation et d'état
    setSelectedStyle(prompt.style || 'auto');
    await generateImage(prompt);
  }

  // Effet pour montrer l'erreur dans un toast si présente
  useEffect(() => {
    if (isError && error) {
      toast({
        variant: "destructive",
        description: error
      });
    }
  }, [isError, error, toast]);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <GenerationForm 
        onSubmit={handleGenerateImage}
        isLoading={isLoading}
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      {isLoading && (
        <div className="mt-4">
          <LoadingIndicator />
        </div>
      )}

      {isError && isInitialized && !isLoading && (
        <div className="mt-6 p-4 bg-destructive/10 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-destructive">Erreur de génération</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error || "Une erreur est survenue lors de la génération de l'image."}
            </p>
            <button 
              onClick={retryGeneration}
              className="mt-3 text-sm bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-md"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {isSuccess && generatedImageUrl && !isLoading && (
        <GeneratedImage
          imageUrl={generatedImageUrl}
          onRegenerate={retryGeneration}
          isLoading={isLoading}
          prompt={lastPrompt?.prompt}
        />
      )}
    </Card>
  )
}
