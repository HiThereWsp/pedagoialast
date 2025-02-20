
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelete: () => Promise<void>;
  itemType: string;
  error?: string;
}

export const DeleteDialog = ({ 
  isOpen, 
  onOpenChange, 
  onDelete, 
  itemType,
  error 
}: DeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Cela supprimera définitivement votre {itemType.toLowerCase()}.
            {error && (
              <p className="text-red-500 mt-2">{error}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
