import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Card, CardContent } from "./ui/card"
import { Lightbulb, FileText, Globe, FileIcon, ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const LessonPlanCreator = () => {
  const [subject, setSubject] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [currentTab, setCurrentTab] = useState("subject")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateLessonPlan = async () => {
    if (currentTab === "subject") {
      if (!subject.trim()) {
        toast({
          title: "Sujet requis",
          description: "Veuillez entrer un sujet pour votre séquence",
          variant: "destructive",
        })
        return
      }

      if (!classLevel.trim()) {
        toast({
          title: "Niveau requis",
          description: "Veuillez entrer le niveau de la classe",
          variant: "destructive",
        })
        return
      }
    } else if (currentTab === "text") {
      if (!sourceText.trim()) {
        toast({
          title: "Texte requis",
          description: "Veuillez entrer un texte source",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const message = currentTab === "subject" 
        ? `Crée une séquence pédagogique sur le sujet: ${subject}. 
           Niveau de la classe: ${classLevel}.
           Instructions supplémentaires: ${additionalInstructions}`
        : `Crée une séquence pédagogique basée sur ce texte: ${sourceText}.
           Instructions supplémentaires: ${additionalInstructions}`

      const { data, error } = await supabase.functions.invoke("chat-with-openai", {
        body: {
          message,
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
          <h1 className="text-2xl font-bold">Créer un plan de cours</h1>
          <p className="text-muted-foreground mt-2">
            Créez un plan de cours à partir de n'importe quelle source : sujet, texte, page Web ou document
          </p>
        </div>
      </div>

      <Tabs defaultValue="subject" className="mb-6" onValueChange={setCurrentTab}>
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

        <CardContent className="space-y-6">
          <TabsContent value="subject">
            <div>
              <label className="text-sm font-medium mb-2 block">Votre sujet</label>
              <Input
                placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Niveau de la classe</label>
              <Input
                placeholder="Par exemple : 6ème, CM2, CE1"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="text">
            <div>
              <label className="text-sm font-medium mb-2 block">Votre texte</label>
              <Textarea
                placeholder="Collez votre texte ici..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Instructions supplémentaires (facultatif)
            </label>
            <Textarea
              placeholder="Précisez toutes les exigences supplémentaires pour votre plan de cours"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
            />
          </div>

          <Button
            className="w-full py-6 text-lg bg-lime-400 hover:bg-lime-500 text-black"
            onClick={handleGenerateLessonPlan}
            disabled={isLoading}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isLoading ? "Génération en cours..." : "Générer un plan de cours"}
          </Button>
        </CardContent>
      </Tabs>
    </Card>
  )
}