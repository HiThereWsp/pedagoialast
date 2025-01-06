import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, MessageSquare, User, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ResultDisplay } from "./ResultDisplay"

export function CorrespondenceGenerator() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("formal")
  const [recipient, setRecipient] = useState("parents")
  const [additionalContext, setAdditionalContext] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        description: "Veuillez saisir un sujet pour la correspondance.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-correspondence', {
        body: { topic, tone, recipient, additionalContext }
      })

      if (error) throw error

      setGeneratedText(data.text)
      toast({
        description: "Correspondance générée avec succès !",
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRecipientIcon = () => {
    switch (recipient) {
      case 'parents':
        return <Users className="h-4 w-4 mr-2" />
      case 'director':
        return <User className="h-4 w-4 mr-2" />
      case 'inspector':
        return <MessageSquare className="h-4 w-4 mr-2" />
      case 'colleague':
        return <Mail className="h-4 w-4 mr-2" />
      default:
        return <Users className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="relative overflow-hidden p-6 space-y-6 bg-white/90 backdrop-blur-md border-[#9b87f5]/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/5 to-[#6E59A5]/5 pointer-events-none" />
        
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-[#7E69AB] font-medium">Destinataire</Label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger className="bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30">
              {getRecipientIcon()}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parents">Parents d'élèves</SelectItem>
              <SelectItem value="director">Direction</SelectItem>
              <SelectItem value="inspector">Inspection</SelectItem>
              <SelectItem value="colleague">Collègue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic" className="text-[#7E69AB] font-medium">Sujet de la correspondance</Label>
          <Input
            id="topic"
            placeholder="Ex: Absence non justifiée, Félicitations, Comportement en classe..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone" className="text-[#7E69AB] font-medium">Ton de la correspondance</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formel</SelectItem>
              <SelectItem value="friendly">Amical</SelectItem>
              <SelectItem value="concerned">Préoccupé</SelectItem>
              <SelectItem value="positive">Positif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context" className="text-[#7E69AB] font-medium">Contexte additionnel (optionnel)</Label>
          <Textarea
            id="context"
            placeholder="Ajoutez des détails spécifiques pour personnaliser la correspondance..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="min-h-[100px] bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !topic}
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            "Générer la correspondance"
          )}
        </Button>
      </Card>

      {generatedText && <ResultDisplay text={generatedText} />}
    </div>
  )
}