import { useState } from "react"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Card, CardContent } from "./ui/card"
import { Lightbulb, FileText, Globe, FileIcon, ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { SubjectTabContent } from "./lesson-plan/SubjectTabContent"
import { TextTabContent } from "./lesson-plan/TextTabContent"
import { WebpageTabContent } from "./lesson-plan/WebpageTabContent"
import { DocumentTabContent } from "./lesson-plan/DocumentTabContent"

export const LessonPlanCreator = () => {
  const [subject, setSubject] = useState("")
  const [webSubject, setWebSubject] = useState("")
  const [webUrl, setWebUrl] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [currentTab, setCurrentTab] = useState("subject")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleGenerateLessonPlan = async () => {
    setIsLoading(true)
    try {
      let prompt = ""
      let content = ""

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour générer un plan de cours",
          variant: "destructive",
        })
        return
      }

      // Validation des champs requis selon l'onglet actif
      if (currentTab === "subject" && (!subject.trim() || !classLevel.trim())) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      } else if (currentTab === "text" && (!sourceText.trim() || !classLevel.trim())) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      } else if (currentTab === "webpage" && (!webSubject.trim() || !webUrl.trim() || !classLevel.trim())) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      } else if (currentTab === "document" && (!selectedFile || !classLevel.trim())) {
        toast({
          title: "Champs requis",
          description: "Veuillez joindre un document et remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      }

      // Préparation du contenu selon l'onglet
      switch (currentTab) {
        case "subject":
          content = subject
          prompt = `Crée une séquence pédagogique sur le sujet: ${subject}. Niveau de la classe: ${classLevel}.`
          break
        case "text":
          content = sourceText
          prompt = `Crée une séquence pédagogique basée sur ce texte: ${sourceText}. Niveau de la classe: ${classLevel}.`
          break
        case "webpage":
          try {
            const { data: webData, error: webError } = await supabase.functions.invoke('process-webpage', {
              body: { url: webUrl }
            })
            if (webError) throw webError
            content = webData.text
            prompt = `Crée une séquence pédagogique sur le sujet: ${webSubject}. Basée sur ce contenu web: ${content}. Niveau de la classe: ${classLevel}.`
          } catch (error) {
            console.error("Erreur lors du traitement de la page web:", error)
            toast({
              title: "Erreur",
              description: "Impossible de traiter la page web",
              variant: "destructive",
            })
            return
          }
          break
        case "document":
          if (selectedFile) {
            try {
              const formData = new FormData()
              formData.append('file', selectedFile)
              const { data: docData, error: docError } = await supabase.functions.invoke('process-document', {
                body: formData
              })
              if (docError) throw docError
              content = docData.text
              prompt = `Crée une séquence pédagogique basée sur ce document: ${content}. Niveau de la classe: ${classLevel}.`
            } catch (error) {
              console.error("Erreur lors du traitement du document:", error)
              toast({
                title: "Erreur",
                description: "Impossible de traiter le document",
                variant: "destructive",
              })
              return
            }
          }
          break
      }

      // Ajout des instructions supplémentaires si présentes
      if (additionalInstructions.trim()) {
        prompt += ` Instructions supplémentaires: ${additionalInstructions}`
      }

      // Appel à l'API OpenAI via la fonction edge
      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: { 
          message: prompt,
          type: 'lesson-plan'
        }
      })

      if (error) throw error

      // Sauvegarde du plan de cours dans la base de données
      const { error: dbError } = await supabase
        .from('chats')
        .insert({
          message: prompt,
          message_type: 'user',
          user_id: user.id,
          lesson_plan_data: {
            source_type: currentTab,
            content,
            class_level: classLevel,
            additional_instructions: additionalInstructions
          }
        })

      if (dbError) throw dbError

      toast({
        title: "Succès",
        description: "Votre séquence pédagogique a été générée avec succès",
      })

    } catch (error) {
      console.error("Erreur lors de la génération du plan de cours:", error)
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
            Créez vos séquences pédagogiques à partir de la source de votre choix
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
            <SubjectTabContent
              subject={subject}
              setSubject={setSubject}
              classLevel={classLevel}
              setClassLevel={setClassLevel}
              additionalInstructions={additionalInstructions}
              setAdditionalInstructions={setAdditionalInstructions}
            />
          </TabsContent>

          <TabsContent value="text">
            <TextTabContent
              sourceText={sourceText}
              setSourceText={setSourceText}
              classLevel={classLevel}
              setClassLevel={setClassLevel}
              additionalInstructions={additionalInstructions}
              setAdditionalInstructions={setAdditionalInstructions}
            />
          </TabsContent>

          <TabsContent value="webpage">
            <WebpageTabContent
              webSubject={webSubject}
              setWebSubject={setWebSubject}
              webUrl={webUrl}
              setWebUrl={setWebUrl}
              classLevel={classLevel}
              setClassLevel={setClassLevel}
              additionalInstructions={additionalInstructions}
              setAdditionalInstructions={setAdditionalInstructions}
            />
          </TabsContent>

          <TabsContent value="document">
            <DocumentTabContent
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
              classLevel={classLevel}
              setClassLevel={setClassLevel}
              additionalInstructions={additionalInstructions}
              setAdditionalInstructions={setAdditionalInstructions}
            />
          </TabsContent>

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