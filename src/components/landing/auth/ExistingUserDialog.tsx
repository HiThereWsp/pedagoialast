
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExistingUserDialogProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleMode: () => void; // Pour changer vers le mode connexion
}

export const ExistingUserDialog = ({
  email,
  open,
  onOpenChange,
  onToggleMode,
}: ExistingUserDialogProps) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onOpenChange(false);
    onToggleMode();
  };

  const handlePasswordReset = () => {
    onOpenChange(false);
    navigate("/forgot-password", { state: { email } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-balance text-2xl font-bold tracking-tight">
            Compte déjà existant
          </DialogTitle>
          <DialogDescription>
            Un compte existe déjà avec l'email <strong>{email}</strong>. Veuillez vous connecter avec vos identifiants existants.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-sm">
          Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser facilement.
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handlePasswordReset}
          >
            Mot de passe oublié
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleGoToLogin}>
            Aller à la connexion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
