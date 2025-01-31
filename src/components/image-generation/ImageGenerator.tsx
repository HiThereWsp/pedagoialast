import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Sparkles, Palette, Image, Box, Smile } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useToolMetrics } from '@/hooks/useToolMetrics'

type ImageStyle = 'auto' | 'general' | 'realistic' | '3d' | 'anime'

const STYLE_OPTIONS = [
  { value: 'auto', label: 'Auto', icon: Sparkles },
  { value: 'general', label: 'Général', icon: Palette },
  { value: 'realistic', label: 'Réaliste', icon: Image },
  { value: '3d', label: '3D', icon: Box },
  { value: 'anime', label: 'Anime', icon: Smile },
] as const

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [modificationPrompt, setModificationPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')
  const { toast } = useToast()
  const { logToolUsage } = useToolMetrics()
  const [predictionId, setPredictionId] = useState<string | null>(null)

  const checkPredictionStatus = async (predictionId: string) => {
    try {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('generate-image', {
        body: { predictionId }
      })

      if (statusError) throw statusError

      if (statusData.status === 'succeeded' && statusData.output) {
        setGeneratedImageUrl(Array.isArray(statusData.output) ? statusData.output[0] : statusData.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'generate')
      } else if (statusData.status === 'failed') {
        throw new Error('La génération a échoué')
      } else {
        // Continue checking if still processing
        setTimeout(() => checkPredictionStatus(predictionId), 1000)
      }
    } catch (error) {
      console.error('Error checking prediction status:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification du statut de la génération"
      })
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const enhancedPrompt = selectedStyle === 'auto' 
        ? prompt 
        : `${prompt} (in ${selectedStyle} style)`

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: enhancedPrompt }
      })

      if (error) throw error

      if (data.predictionId) {
        setPredictionId(data.predictionId)
        checkPredictionStatus(data.predictionId)
      } else if (data.output) {
        setGeneratedImageUrl(Array.isArray(data.output) ? data.output[0] : data.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'generate')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'image"
      })
      setIsLoading(false)
    }
  }

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generatedImageUrl) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: modificationPrompt,
          image: generatedImageUrl // Pour une future implémentation de img2img
        }
      })

      if (error) throw error

      if (data.predictionId) {
        setPredictionId(data.predictionId)
        checkPredictionStatus(data.predictionId)
      } else if (data.output) {
        setGeneratedImageUrl(Array.isArray(data.output) ? data.output[0] : data.output)
        setIsLoading(false)
        await logToolUsage('image_generation', 'modify')
      }
    } catch (error) {
      console.error('Error modifying image:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'image"
      })
      setIsLoading(false)
    }
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
            className="flex flex-wrap gap-2"
          >
            {STYLE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <div key={value} className="relative">
                <RadioGroupItem
                  value={value}
                  id={value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={value}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border-2 cursor-pointer
                    transition-colors hover:bg-accent
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary
                    peer-data-[state=checked]:bg-primary/5"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Label>
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