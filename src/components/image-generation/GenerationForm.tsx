import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageStyleSelector } from './ImageStyleSelector'
import { ImageStyle, GenerationPrompt } from './types'

interface GenerationFormProps {
  onSubmit: (prompt: GenerationPrompt) => void
  isLoading: boolean
}

export const GenerationForm = ({ onSubmit, isLoading }: GenerationFormProps) => {
  const [userPrompt, setUserPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      context: '',
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
          placeholder="Une image de..."
          className="w-full"
        />
      </div>

      <ImageStyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-[#FFD700] via-[#FF69B4] to-[#FF8C00] text-black font-semibold hover:opacity-90 transition-opacity"
        disabled={!userPrompt.trim() || isLoading}
      >
        Générer l'image
      </Button>
    </form>
  )
}