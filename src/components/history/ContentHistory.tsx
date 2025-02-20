
import { Card } from "@/components/ui/card";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";
import { type SavedContent } from "@/types/saved-content";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContentHistoryProps {
  title: string;
  type: string;
  items: SavedContent[];
  onDelete?: (id: string) => Promise<void>;
  emptyMessage: string;
  colorScheme?: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
}

const getDisplayType = (type: string): string => {
  switch (type) {
    case 'lesson-plan':
      return 'Séquence';
    case 'exercise':
      return 'Exercice';
    case 'Image':
      return 'Image';
    default:
      return type;
  }
};

export const ContentHistory = ({ 
  title, 
  type, 
  items, 
  onDelete,
  emptyMessage,
  colorScheme = {
    color: '#22C55E',
    backgroundColor: '#22C55E20',
    borderColor: '#22C55E4D'
  }
}: ContentHistoryProps) => {
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, itemId: "" });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(deleteDialog.itemId);
      toast({
        description: `${getDisplayType(type)} supprimé avec succès`
      });
      setDeleteDialog({ isOpen: false, itemId: "" });
    } catch (err) {
      setError(`Erreur lors de la suppression du ${type.toLowerCase()}`);
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const transformedItems = items.map(item => ({
    ...item,
    displayType: getDisplayType(item.type),
    tags: [{
      label: getDisplayType(item.type),
      ...colorScheme
    }]
  }));

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {transformedItems.length > 0 ? (
        <HistoryCarousel
          items={transformedItems}
          onItemSelect={(item) => {
            setSelectedContent(item);
            if (onDelete) {
              setDeleteDialog({ isOpen: true, itemId: item.id });
            }
          }}
          selectedItemId={selectedContent?.id}
        />
      ) : (
        <Card className="p-8 text-center text-muted-foreground bg-gray-50">
          <p>{emptyMessage}</p>
        </Card>
      )}

      {onDelete && (
        <AlertDialog 
          open={deleteDialog.isOpen} 
          onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera définitivement votre {type.toLowerCase()}.
                {error && (
                  <p className="text-red-500 mt-2">{error}</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
