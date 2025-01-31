import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageStyleSelector } from './ImageStyleSelector'
import { ImageStyle } from './types'

interface GenerationFormProps {
  onSubmit: (prompt: string, style: ImageStyle) => void
  isLoading: boolean
}

export const GenerationForm = ({ onSubmit, isLoading }: GenerationFormProps) => {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('auto')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(prompt, selectedStyle)
  }

  return (
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

      <ImageStyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={!prompt.trim() || isLoading}
      >
        Générer l'image
      </Button>
    </form>
  )
}