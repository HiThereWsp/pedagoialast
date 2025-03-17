
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { checkBetaWelcomeMessage, markBetaWelcomeMessageAsSent } from "@/hooks/subscription/useBetaCheck";

export const BetaWelcomeNotification = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const checkWelcomeMessage = async () => {
      setIsLoading(true);
      try {
        const shouldShowMessage = await checkBetaWelcomeMessage(user.id);
        if (shouldShowMessage) {
          setOpen(true);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du message de bienvenue:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWelcomeMessage();
  }, [user?.id]);

  const handleClose = async () => {
    if (user?.id) {
      await markBetaWelcomeMessageAsSent(user.id);
    }
    setOpen(false);
  };

  if (isLoading || !user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Bienvenue dans votre accès gratuit à notre version Beta
        </DialogTitle>
        <DialogDescription className="mt-2 text-gray-600">
          <p className="mb-4">
            Nous tenons à vous remercier d'avoir fait partie des premiers utilisateurs de PedagoIA.
          </p>
          <p className="mb-4">
            En tant qu'utilisateur Beta validé, vous bénéficiez d'un accès complet et gratuit à toutes les fonctionnalités de la plateforme.
          </p>
          <p className="font-medium">
            Pour toute question, contactez-nous à : <a href="mailto:bonjour@pedagoia.fr" className="text-blue-600 hover:underline">bonjour@pedagoia.fr</a>
          </p>
        </DialogDescription>
        <DialogFooter className="mt-4">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            J'ai compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
