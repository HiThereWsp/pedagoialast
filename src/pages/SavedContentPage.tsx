
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { useSavedContent } from "@/hooks/useSavedContent";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentHeader } from "@/components/saved-content/SavedContentHeader";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { carouselCategories } from "@/components/saved-content/CarouselCategories";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";

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
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const exercises = await getSavedExercises();
      setErrors(prev => ({ ...prev, exercises: undefined }));
      
      const lessonPlans = await getSavedLessonPlans();
      setErrors(prev => ({ ...prev, lessonPlans: undefined }));
      
      const formattedExercises: SavedContent[] = exercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        content: ex.content,
        subject: ex.subject,
        class_level: ex.class_level,
        created_at: ex.created_at,
        type: 'exercise',
        displayType: 'Exercice',
        tags: [{
          label: 'Exercice',
          color: '#22C55E',
          backgroundColor: '#22C55E20',
          borderColor: '#22C55E4D'
        }]
      }));

      const formattedLessonPlans: SavedContent[] = lessonPlans.map(plan => ({
        id: plan.id,
        title: plan.title,
        content: plan.content,
        subject: plan.subject,
        class_level: plan.class_level,
        created_at: plan.created_at,
        type: 'lesson-plan',
        displayType: 'Séquence',
        tags: [{
          label: 'Séquence',
          color: '#FF9EBC',
          backgroundColor: '#FF9EBC20',
          borderColor: '#FF9EBC4D'
        }]
      }));

      setContent([...formattedExercises, ...formattedLessonPlans]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
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

  const handleDelete = async (id: string, type: 'lesson-plan' | 'exercise' | 'Image') => {
    setErrors(prev => ({
      ...prev,
      delete: undefined
    }));
    try {
      if (type === 'exercise') {
        await deleteSavedExercise(id);
      } else if (type === 'lesson-plan') {
        await deleteSavedLessonPlan(id);
      }
      toast({
        description: `${type === 'exercise' ? 'Exercice' : 'Séquence'} supprimé avec succès`
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
        delete: `Erreur lors de la suppression du ${type === 'exercise' ? 'exercice' : 'séquence'}`
      }));
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const transformToHistoryItems = (items: SavedContent[], type: 'lesson-plan' | 'exercise' | 'Image'): SavedContent[] => {
    const category = carouselCategories.find(cat => cat.type === type);
    if (!category) return [];

    return items
      .filter(item => item.type === type)
      .map(item => ({
        ...item,
        type: type,
        tags: [{
          label: category.displayType,
          ...category.colorScheme
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

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8">
        <SavedContentHeader />

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
                      setSelectedContent(item);
                      setDeleteDialog({
                        isOpen: true,
                        itemId: item.id,
                        itemType: category.displayType
                      });
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

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
        onDelete={() => handleDelete(deleteDialog.itemId, content.find(item => item.id === deleteDialog.itemId)?.type || 'lesson-plan')}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
}
