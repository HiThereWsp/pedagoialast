import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { Textarea } from '@/components/ui/textarea'

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [modificationPrompt, setModificationPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Pour l'instant, on simule juste le chargement
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generatedImageUrl) return
    
    setIsLoading(true)
    // Pour l'instant, on simule juste le chargement de la modification
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            Décrivez l'image que vous souhaitez générer
          </label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Un chat siamois blanc jouant avec une pelote de laine bleue..."
            className="w-full"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={!prompt.trim() || isLoading}
        >
          Générer l'image
        </Button>
      </form>

      {isLoading && (
        <div className="mt-4">
          <LoadingIndicator />
        </div>
      )}

      {generatedImageUrl && !isLoading && (
        <div className="mt-6 space-y-4">
          <img
            src={generatedImageUrl}
            alt="Generated"
            className="w-full h-auto rounded-lg shadow-lg"
          />
          
          <form onSubmit={handleModify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="modification" className="text-sm font-medium">
                Modifiez l'image avec une description
              </label>
              <Textarea
                id="modification"
                value={modificationPrompt}
                onChange={(e) => setModificationPrompt(e.target.value)}
                placeholder="Ajoutez des modifications à l'image, par exemple: 'Ajoutez un fond bleu ciel'"
                className="w-full min-h-[100px]"
              />
            </div>

            <Button 
              type="submit" 
              variant="secondary"
              className="w-full"
              disabled={!modificationPrompt.trim() || isLoading}
            >
              Modifier l'image
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}