import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type ImageStyle = 'auto' | 'general' | 'realistic' | '3d' | 'anime'

const STYLE_DESCRIPTIONS = {
  auto: "L'IA choisit le style le plus adapté au contexte",
  general: "Style standard, adapté à la plupart des situations",
  realistic: "Rendu photoréaliste, parfait pour des illustrations détaillées",
  "3d": "Rendu en trois dimensions, idéal pour les représentations spatiales",
  anime: "Style manga/anime, pour des visuels ludiques et engageants"
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [modificationPrompt, setModificationPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')

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
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-3">
          <Label className="text-sm font-medium">Style de l'image</Label>
          <RadioGroup
            value={selectedStyle}
            onValueChange={(value) => setSelectedStyle(value as ImageStyle)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(STYLE_DESCRIPTIONS).map(([style, description]) => (
              <div key={style} className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                <RadioGroupItem value={style} id={style} className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor={style} className="font-medium capitalize">
                    {style === '3d' ? '3D' : style}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
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