import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export function CorrespondenceGenerator() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("formal")
  const [recipient, setRecipient] = useState("parents")
  const [additionalContext, setAdditionalContext] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      setIsCopied(true)
      toast({
        description: "Texte copié dans le presse-papier !",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        description: "Erreur lors de la copie du texte.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipient">Destinataire</Label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger>
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
          <Label htmlFor="topic">Sujet de la correspondance</Label>
          <Input
            id="topic"
            placeholder="Ex: Absence non justifiée, Félicitations, Comportement en classe..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Ton de la correspondance</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
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
          <Label htmlFor="context">Contexte additionnel (optionnel)</Label>
          <Textarea
            id="context"
            placeholder="Ajoutez des détails spécifiques pour personnaliser la correspondance..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !topic}
          className="w-full"
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

      {generatedText && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Correspondance générée</h3>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
            >
              {isCopied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">
            {generatedText}
          </div>
        </Card>
      )}
    </div>
  )
}