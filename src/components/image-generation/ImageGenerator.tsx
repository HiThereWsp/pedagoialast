import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('')
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

        {isLoading && (
          <div className="mt-4">
            <LoadingIndicator />
          </div>
        )}

        {generatedImageUrl && (
          <div className="mt-4">
            <img
              src={generatedImageUrl}
              alt="Generated"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </form>
    </Card>
  )
}