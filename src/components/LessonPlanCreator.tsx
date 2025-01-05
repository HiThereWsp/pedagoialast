import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

const CLASS_LEVELS = [
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "2nde",
  "1ère",
  "Terminale"
]

export function LessonPlanCreator() {
  const [subject, setSubject] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !classLevel) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires"
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: {
          message: subject,
          type: 'lesson-plan',
          context: JSON.stringify({
            classLevel,
            additionalInstructions
          })
        }
      })

      if (error) throw error

      toast({
        title: "Séquence générée avec succès",
        description: "Votre séquence pédagogique a été créée"
      })

      // Reset form
      setSubject("")
      setClassLevel("")
      setAdditionalInstructions("")
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la séquence"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="subject">Sujet de la séquence *</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Les fractions en mathématiques"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classLevel">Niveau de classe *</Label>
        <Select value={classLevel} onValueChange={setClassLevel} required>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un niveau" />
          </SelectTrigger>
          <SelectContent>
            {CLASS_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInstructions">Instructions supplémentaires (optionnel)</Label>
        <Textarea
          id="additionalInstructions"
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="Ajoutez des instructions spécifiques pour la génération de votre séquence"
          className="h-32"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          "Générer la séquence"
        )}
      </Button>
    </form>
  )
}