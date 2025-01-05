import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent } from "./ui/card"
import { Lightbulb, FileText, Globe, FileIcon, ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const LessonPlanCreator = () => {
  const [subject, setSubject] = useState("")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [standards, setStandards] = useState("")
  const [outputLanguage, setOutputLanguage] = useState("Français")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateLessonPlan = async () => {
    if (!subject.trim()) {
      toast({
        title: "Sujet requis",
        description: "Veuillez entrer un sujet pour votre séquence",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke("chat-with-openai", {
        body: {
          message: `Crée une séquence pédagogique sur le sujet: ${subject}. 
                   Instructions supplémentaires: ${additionalInstructions}
                   Normes à respecter: ${standards}`,
          type: "lesson-plan",
        },
      })

      if (error) throw error

      toast({
        title: "Séquence générée avec succès",
        description: "Votre séquence pédagogique a été créée",
      })

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la séquence",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">Créer une séquence pédagogique</h1>
          <p className="text-muted-foreground mt-2">
            Créez une séquence pédagogique à partir de n'importe quelle source
          </p>
        </div>
      </div>

      <Tabs defaultValue="subject" className="mb-6">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="subject" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sujet
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Texte
          </TabsTrigger>
          <TabsTrigger value="webpage" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Page web
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            Document
            <span className="bg-yellow-200 text-yellow-800 text-xs px-1.5 py-0.5 rounded">Pro</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Votre sujet</label>
          <Input
            placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Instructions supplémentaires (facultatif)
          </label>
          <Textarea
            placeholder="Précisez toutes les exigences supplémentaires, telles que les niveaux des étudiants, les normes à respecter, etc."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Normes (optionnelles)
            </label>
            <Input
              placeholder="Normes NGSS, NYS, etc."
              value={standards}
              onChange={(e) => setStandards(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Langue de sortie
            </label>
            <Select value={outputLanguage} onValueChange={setOutputLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Français">Français</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full py-6 text-lg bg-emerald-500 hover:bg-emerald-600"
          onClick={handleGenerateLessonPlan}
          disabled={isLoading}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isLoading ? "Génération en cours..." : "Générer une séquence pédagogique"}
        </Button>
      </CardContent>
    </Card>
  )
}