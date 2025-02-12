
import { useEffect, useState } from "react"
import { SEO } from "@/components/SEO"
import { Card } from "@/components/ui/card"
import { useSavedContent } from "@/hooks/useSavedContent"
import { Loader2, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"

interface SavedContent {
  id: string
  title: string
  description?: string
  content: string
  type: string
  created_at: string
}

const ITEMS_PER_PAGE = 6

export default function SavedContentPage() {
  const [content, setContent] = useState<SavedContent[]>([])
  const [errors, setErrors] = useState<{
    exercises?: string;
    lessonPlans?: string;
    delete?: string;
  }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: "",
  })
  
  const { 
    isLoadingExercises,
    isLoadingLessonPlans, 
    getSavedExercises, 
    getSavedLessonPlans, 
    deleteSavedExercise, 
    deleteSavedLessonPlan 
  } = useSavedContent()
  
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const fetchContent = async () => {
    try {
      const exercises = await getSavedExercises()
      setErrors(prev => ({ ...prev, exercises: undefined }))
      const lessonPlans = await getSavedLessonPlans()
      setErrors(prev => ({ ...prev, lessonPlans: undefined }))

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
      console.error("Erreur lors du chargement des contenus:", err)
      if (err instanceof Error) {
        setErrors(prev => ({
          ...prev,
          exercises: "Une erreur est survenue lors du chargement de vos contenus"
        }))
      }
    }
  }

  useEffect(() => {
    fetchContent()
  }, [getSavedExercises, getSavedLessonPlans])

  const handleDelete = async (id: string, type: string) => {
    setErrors(prev => ({ ...prev, delete: undefined }))
    try {
      if (type === 'Exercice') {
        await deleteSavedExercise(id)
      } else {
        await deleteSavedLessonPlan(id)
      }
      
      toast({
        description: `${type} supprimé avec succès`,
      })
      
      setDeleteDialog({ isOpen: false, itemId: "", itemType: "" })
      fetchContent()
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        delete: `Erreur lors de la suppression du ${type.toLowerCase()}`
      }))
      console.error("Erreur lors de la suppression:", err)
    }
  }

  const totalPages = Math.ceil(content.length / ITEMS_PER_PAGE)
  const paginatedContent = content.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Historique de mon contenu</h1>
          {content.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              {content.length} contenu{content.length > 1 ? 's' : ''} sauvegardé{content.length > 1 ? 's' : ''} 
              (maximum 15)
            </p>
          )}
        </div>

        {isLoadingExercises || isLoadingLessonPlans ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : errors.exercises || errors.lessonPlans ? (
          <Card className="p-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>{errors.exercises || errors.lessonPlans}</p>
            </div>
          </Card>
        ) : content.length === 0 ? (
          <Card className="p-6 space-y-4">
            <p className="text-center text-muted-foreground">
              Vous n'avez pas encore de contenus sauvegardés.
            </p>
            <p className="text-center text-muted-foreground">
              Commencez par créer un exercice ou une séquence pédagogique, puis sauvegardez-le pour le retrouver ici !
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {paginatedContent.map((item) => (
                <Card 
                  key={item.id}
                  className="p-4 md:p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
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
                        onClick={() => setDeleteDialog({
                          isOpen: true,
                          itemId: item.id,
                          itemType: item.type
                        })}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <div className="flex items-center gap-2 px-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      className={`w-8 h-8 p-0 ${isMobile && page > 3 ? 'hidden' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(isOpen) => 
          setDeleteDialog(prev => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre {deleteDialog.itemType.toLowerCase()}.
              {errors.delete && (
                <p className="text-red-500 mt-2">{errors.delete}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.itemId, deleteDialog.itemType)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
