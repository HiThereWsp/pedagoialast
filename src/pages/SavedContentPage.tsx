
import { useEffect, useState } from "react"
import { SEO } from "@/components/SEO"
import { Card } from "@/components/ui/card"
import { useSavedContent } from "@/hooks/useSavedContent"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SavedContent {
  id: string
  title: string
  description?: string
  content: string
  type: string
  created_at: string
}

export default function SavedContentPage() {
  const [content, setContent] = useState<SavedContent[]>([])
  const [error, setError] = useState<string | null>(null)
  const { isLoading, getSavedExercises, getSavedLessonPlans, deleteSavedExercise, deleteSavedLessonPlan } = useSavedContent()
  const { toast } = useToast()

  const fetchContent = async () => {
    try {
      const exercises = await getSavedExercises()
      const lessonPlans = await getSavedLessonPlans()

      const formattedExercises = exercises.map(ex => ({
        ...ex,
        type: 'Exercice',
        description: ex.content.substring(0, 100) + '...'
      }))

      const formattedLessonPlans = lessonPlans.map(plan => ({
        ...plan,
        type: 'Séquence',
        description: plan.content.substring(0, 100) + '...'
      }))

      setContent([...formattedExercises, ...formattedLessonPlans].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de vos contenus")
      console.error("Erreur lors du chargement des contenus:", err)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [getSavedExercises, getSavedLessonPlans])

  const handleDelete = async (id: string, type: string) => {
    try {
      if (type === 'Exercice') {
        await deleteSavedExercise(id)
      } else {
        await deleteSavedLessonPlan(id)
      }
      
      toast({
        description: `${type} supprimé avec succès`,
      })
      
      // Rafraîchir la liste
      fetchContent()
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Erreur lors de la suppression du ${type.toLowerCase()}`,
      })
      console.error("Erreur lors de la suppression:", err)
    }
  }

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Historique de mon contenu</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-red-500">
            {error}
          </Card>
        ) : content.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Vous n'avez pas encore de contenus sauvegardés.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card 
                key={item.id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {item.type}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id, item.type)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
