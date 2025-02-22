
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentHeader } from "@/components/saved-content/SavedContentHeader";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { SavedContentList } from "@/components/saved-content/SavedContentList";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { useSavedContentManagement } from "@/hooks/useSavedContentManagement";

export default function SavedContentPage() {
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
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
    content,
    errors,
    isLoading,
    fetchContent,
    handleDelete
  } = useSavedContentManagement();

  useEffect(() => {
    fetchContent();
  }, []);

  if (isLoading) {
    return <SavedContentLoader />;
  }

  if (errors.exercises || errors.lessonPlans || errors.correspondences) {
    return (
      <SavedContentError 
        error={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
      />
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

        <SavedContentList
          content={content}
          onItemSelect={(item) => {
            setSelectedContent(item);
            setDeleteDialog({
              isOpen: true,
              itemId: item.id,
              itemType: item.displayType || ""
            });
          }}
          selectedItemId={selectedContent?.id}
        />
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
