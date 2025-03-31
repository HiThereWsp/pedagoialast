
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { Mail, Copy, CheckCircle } from "lucide-react";

export const CancellationButton = () => {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  
  const handleCancellationRequest = () => {
    // Track the event in PostHog
    subscriptionEvents.cancellationRequested('settings_page');
    
    // Close the alert dialog and open the copy dialog
    setIsAlertOpen(false);
    setIsCopyDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setHasCopied(true);
        toast({
          title: "Copié avec succès",
          description: "Le texte a été copié dans votre presse-papier."
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setHasCopied(false);
        }, 2000);
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de copier le texte. Veuillez le copier manuellement."
        });
      });
  };

  const emailInfo = {
    address: "bonjour@pedagoia.fr",
    subject: "Demande de résiliation de mon abonnement",
    body: "Bonjour,\n\nJe souhaite résilier mon abonnement à PedagoIA.\n\nCordialement,"
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
            <Mail className="mr-2 h-4 w-4" />
            Demander la résiliation de mon abonnement
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demande de résiliation</AlertDialogTitle>
            <AlertDialogDescription>
              Pour résilier votre abonnement, veuillez nous envoyer un email avec votre demande.
              Nous allons vous fournir toutes les informations nécessaires pour faciliter cette démarche.
              Votre abonnement restera actif jusqu'à ce que nous traitions votre demande.
              Cette demande est gratuite et prendra en compte votre période d'essai si elle est toujours en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancellationRequest} className="bg-destructive hover:bg-destructive/90">
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy dialog with email information */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email de résiliation</DialogTitle>
            <DialogDescription>
              Veuillez envoyer un email à l'adresse ci-dessous avec les informations fournies pour demander la résiliation de votre abonnement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Adresse email :</p>
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <code className="text-sm">{emailInfo.address}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(emailInfo.address)}
                  className="gap-1"
                >
                  {hasCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  Copier
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-sm">Objet suggéré :</p>
              <div className="bg-muted/50 p-2 rounded-md">
                <p className="text-sm">{emailInfo.subject}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(emailInfo.subject)}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copier l'objet
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-sm">Message suggéré :</p>
              <div className="bg-muted/50 p-2 rounded-md whitespace-pre-line">
                <p className="text-sm">{emailInfo.body}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(emailInfo.body)}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copier le message
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="default" onClick={() => setIsCopyDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
