
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageStyleSelector } from './ImageStyleSelector'
import { GenerationPrompt } from '@/hooks/image-generation/types'
import { Loader2 } from 'lucide-react'

interface GenerationFormProps {
  onSubmit: (prompt: GenerationPrompt) => void
  isLoading: boolean
  selectedStyle: string
  onStyleChange: (style: string) => void
}

export const GenerationForm = ({ 
  onSubmit, 
  isLoading, 
  selectedStyle, 
  onStyleChange 
}: GenerationFormProps) => {
  const [userPrompt, setUserPrompt] = useState('')
  const [isClicked, setIsClicked] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userPrompt.trim()) return;
    
    setIsClicked(true)
    
    await onSubmit({
      context: '',
      prompt: userPrompt,
      user_prompt: userPrompt,
      style: selectedStyle
    })
    
    setIsClicked(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          Décrivez l&apos;image que vous souhaitez générer
        </label>
        <Input
          id="prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Une image de..."
          className="w-full"
          disabled={isLoading}
        />
      </div>

      <ImageStyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={onStyleChange}
      />

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-[#FFD700] via-[#FF69B4] to-[#FF8C00] text-black font-semibold hover:opacity-90 transition-opacity relative"
        disabled={!userPrompt.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : isClicked ? (
          "Traitement..."
        ) : (
          "Générer l'image"
        )}
      </Button>
    </form>
  )
}
