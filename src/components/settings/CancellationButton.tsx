
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { Mail, ExternalLink } from "lucide-react";

export const CancellationButton = () => {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  
  const handleCancellationRequest = () => {
    // Track the event in PostHog
    subscriptionEvents.cancellationRequested('settings_page');

    // Prepare email content
    const subject = encodeURIComponent('Demande de résiliation de mon abonnement');
    const body = encodeURIComponent('Bonjour,\n\nJe souhaite résilier mon abonnement à PedagoIA.\n\nCordialement,');
    const mailtoLink = `mailto:bonjour@pedagoia.fr?subject=${subject}&body=${body}`;

    // Try to open the mail client directly
    const mailWindow = window.open(mailtoLink, '_blank');
    
    // Close the alert dialog
    setIsAlertOpen(false);
    
    // Check if window.open was successful
    if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
      // If window.open failed, try the default location method
      window.location.href = mailtoLink;
      
      // Set a small timeout to check if the redirect worked
      setTimeout(() => {
        // Show the fallback dialog if needed
        setIsFallbackOpen(true);
      }, 500);
    } else {
      // Window.open seemed to work, show success toast
      toast({
        title: "Email de résiliation",
        description: "Votre client email a été ouvert pour envoyer la demande de résiliation."
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('bonjour@pedagoia.fr')
      .then(() => {
        toast({
          title: "Adresse copiée",
          description: "L'adresse email a été copiée dans votre presse-papier."
        });
        setIsFallbackOpen(false);
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de copier l'adresse. Veuillez la copier manuellement."
        });
      });
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
              Cette action va ouvrir votre client email pour envoyer une demande de résiliation à notre équipe. 
              Votre abonnement restera actif jusqu'à ce que nous traitions votre demande.
              Cette demande est gratuite et prendra en compte votre période d'essai si elle est toujours en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancellationRequest} className="bg-destructive hover:bg-destructive/90">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fallback dialog if email client doesn't open automatically */}
      <Dialog open={isFallbackOpen} onOpenChange={setIsFallbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impossible d'ouvrir le client email</DialogTitle>
            <DialogDescription>
              Votre navigateur n'a pas pu ouvrir automatiquement votre client email. Veuillez envoyer manuellement un email à l'adresse ci-dessous:
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-muted/50 rounded-md my-4">
            <p className="font-semibold mb-1">Adresse email:</p>
            <div className="flex items-center justify-between bg-background p-2 rounded border">
              <code className="text-sm">bonjour@pedagoia.fr</code>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                Copier
              </Button>
            </div>
            
            <p className="font-semibold mt-4 mb-1">Objet:</p>
            <p className="bg-background p-2 rounded border">Demande de résiliation de mon abonnement</p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsFallbackOpen(false)}>
              J'ai compris
            </Button>
            <Button variant="outline" onClick={() => {
              window.open('https://mail.google.com/mail/u/0/?view=cm&fs=1&to=bonjour@pedagoia.fr&su=Demande+de+résiliation+de+mon+abonnement', '_blank');
            }}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir Gmail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
