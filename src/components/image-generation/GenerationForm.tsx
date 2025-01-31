import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageStyleSelector } from './ImageStyleSelector'
import { ImageStyle, GenerationPrompt } from './types'

interface GenerationFormProps {
  onSubmit: (prompt: GenerationPrompt) => void
  isLoading: boolean
}

const EDUCATIONAL_CONTEXT = "Création d'images éducatives pour des enseignants, avec un focus sur la clarté, l'engagement visuel et la pédagogie."

export const GenerationForm = ({ onSubmit, isLoading }: GenerationFormProps) => {
  const [userPrompt, setUserPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      context: EDUCATIONAL_CONTEXT,
      user_prompt: userPrompt,
      style: selectedStyle
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          Décrivez l'image que vous souhaitez générer
        </label>
        <Input
          id="prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Un croquis d'une cellule animale avec des légendes pour chaque organite..."
          className="w-full"
        />
      </div>

      <ImageStyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={!userPrompt.trim() || isLoading}
      >
        Générer l'image
      </Button>
    </form>
  )
}