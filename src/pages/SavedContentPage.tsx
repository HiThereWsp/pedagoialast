import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { useSavedContent } from "@/hooks/useSavedContent";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";
import { type SavedContent } from "@/types/saved-content";

export default function SavedContentPage() {
  const [content, setContent] = useState<SavedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [errors, setErrors] = useState<{
    exercises?: string;
    lessonPlans?: string;
    delete?: string;
  }>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: ""
  });
  const {
    isLoadingExercises,
    isLoadingLessonPlans,
    getSavedExercises,
    getSavedLessonPlans,
    deleteSavedExercise,
    deleteSavedLessonPlan
  } = useSavedContent();
  const {
    toast
  } = useToast();
  const fetchContent = async () => {
    try {
      const exercises = await getSavedExercises();
      setErrors(prev => ({
        ...prev,
        exercises: undefined
      }));
      const lessonPlans = await getSavedLessonPlans();
      setErrors(prev => ({
        ...prev,
        lessonPlans: undefined
      }));
      const formattedExercises = exercises.map(ex => ({
        ...ex,
        type: 'Exercice',
        description: ex.content.substring(0, 100) + '...'
      }));
      const formattedLessonPlans = lessonPlans.map(plan => ({
        ...plan,
        type: 'Séquence',
        description: plan.content.substring(0, 100) + '...'
      }));
      setContent([...formattedExercises, ...formattedLessonPlans].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error("Erreur lors du chargement des contenus:", err);
      if (err instanceof Error) {
        setErrors(prev => ({
          ...prev,
          exercises: "Une erreur est survenue lors du chargement de vos contenus"
        }));
      }
    }
  };
  useEffect(() => {
    fetchContent();
  }, []);
  const handleDelete = async (id: string, type: string) => {
    setErrors(prev => ({
      ...prev,
      delete: undefined
    }));
    try {
      if (type === 'Exercice') {
        await deleteSavedExercise(id);
      } else {
        await deleteSavedLessonPlan(id);
      }
      toast({
        description: `${type} supprimé avec succès`
      });
      setDeleteDialog({
        isOpen: false,
        itemId: "",
        itemType: ""
      });
      fetchContent();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        delete: `Erreur lors de la suppression du ${type.toLowerCase()}`
      }));
      console.error("Erreur lors de la suppression:", err);
    }
  };
  const transformToHistoryItems = (items: SavedContent[], type: string) => {
    const colorMap = {
      'Séquence': {
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      },
      'Exercice': {
        color: '#22C55E',
        backgroundColor: '#22C55E20',
        borderColor: '#22C55E4D'
      },
      'Image': {
        color: '#F2FCE2',
        backgroundColor: '#F2FCE220',
        borderColor: '#F2FCE24D'
      }
    };

    return items
      .filter(item => item.type === type)
      .map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        subject: item.subject,
        created_at: item.created_at,
        tags: [{
          label: type,
          ...colorMap[type as keyof typeof colorMap]
        }]
      }));
  };

  if (isLoadingExercises || isLoadingLessonPlans) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errors.exercises || errors.lessonPlans) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{errors.exercises || errors.lessonPlans}</p>
        </div>
      </Card>
    );
  }

  const carouselCategories = [
    {
      title: "Mes séquences pédagogiques",
      type: "Séquence",
      emptyMessage: "Vous n'avez pas encore généré de séquence pédagogique. C'est le moment de laisser libre cours à votre créativité !"
    },
    {
      title: "Mes exercices",
      type: "Exercice",
      emptyMessage: "Aucun exercice n'a encore été créé. Commencez à générer des exercices adaptés à vos besoins !"
    },
    {
      title: "Mes images",
      type: "Image",
      emptyMessage: "Votre galerie d'images est vide pour le moment. Générez votre première illustration pédagogique !"
    }
  ];

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Mes ressources pédagogiques générées</h1>
        </div>

        <div className="space-y-8">
          {carouselCategories.map(category => {
            const items = transformToHistoryItems(content, category.type);
            
            return (
              <div key={category.type} className="space-y-4">
                <h2 className="text-xl font-semibold">{category.title}</h2>
                {items.length > 0 ? (
                  <HistoryCarousel
                    items={items}
                    onItemSelect={(item) => {
                      const selectedItem = content.find(c => c.id === item.id);
                      if (selectedItem) {
                        setSelectedContent(selectedItem);
                        setDeleteDialog({
                          isOpen: true,
                          itemId: selectedItem.id,
                          itemType: selectedItem.type
                        });
                      }
                    }}
                    selectedItemId={selectedContent?.id}
                  />
                ) : (
                  <Card className="p-8 text-center text-muted-foreground bg-gray-50">
                    <p>{category.emptyMessage}</p>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
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
              {errors.delete && <p className="text-red-500 mt-2">{errors.delete}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.itemId, deleteDialog.itemType)} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
