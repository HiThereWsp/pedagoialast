import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface NewSuggestionFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

export const NewSuggestionForm = ({ onSubmit, onCancel }: NewSuggestionFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (title && description) {
      onSubmit(title, description)
      setTitle('')
      setDescription('')
    }
  }

  return (
    <Card className="p-6 mb-4 bg-white/90 backdrop-blur-md border border-[#FF9633]/10 shadow-lg">
      <div className="space-y-4">
        <Input
          placeholder="Titre de votre suggestion"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-2 focus:border-[#FF9633] transition-all duration-200 rounded-xl"
        />
        <textarea
          placeholder="Description détaillée de votre suggestion..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 border-2 rounded-xl h-32 focus:outline-none focus:border-[#FF9633] transition-all duration-200 bg-white resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-xl"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-lg rounded-xl"
            disabled={!title || !description}
          >
            Publier la suggestion
          </Button>
        </div>
      </div>
    </Card>
  )
}