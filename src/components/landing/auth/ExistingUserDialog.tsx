
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExistingUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  email: string;
}

export function ExistingUserDialog({
  isOpen,
  onClose,
  onSwitchToSignIn,
  email,
}: ExistingUserDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold tracking-tight text-balance">
            Compte existant détecté
          </DialogTitle>
          <DialogDescription>
            Un compte avec l'email <span className="font-semibold">{email}</span> existe déjà.
            Veuillez vous connecter avec cet email ou réinitialiser votre mot de passe si vous l'avez oublié.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/forgot-password")}
            className="w-full sm:w-auto"
          >
            Mot de passe oublié
          </Button>
          <Button
            onClick={() => {
              onSwitchToSignIn();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Aller à la connexion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
