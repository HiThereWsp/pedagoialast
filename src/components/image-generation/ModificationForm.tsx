import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ModificationFormProps {
  onSubmit: (modificationPrompt: string) => void
  isLoading: boolean
}

export const ModificationForm = ({ onSubmit, isLoading }: ModificationFormProps) => {
  const [modificationPrompt, setModificationPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(modificationPrompt)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  )
}