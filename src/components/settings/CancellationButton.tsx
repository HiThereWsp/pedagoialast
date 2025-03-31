import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { Mail } from "lucide-react";
export const CancellationButton = () => {
  const {
    toast
  } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const handleCancellationRequest = () => {
    // Track the event in PostHog
    subscriptionEvents.cancellationRequested('settings_page');

    // Open the default mail client with pre-filled data
    const subject = encodeURIComponent('Demande de résiliation de mon abonnement');
    const body = encodeURIComponent('Bonjour,\n\nJe souhaite résilier mon abonnement à PedagoIA.\n\nCordialement,');
    window.location.href = `mailto:bonjour@pedagoia.fr?subject=${subject}&body=${body}`;

    // Close the dialog
    setIsOpen(false);

    // Show a confirmation toast
    toast({
      title: "Email de résiliation",
      description: "Votre client email a été ouvert pour envoyer la demande de résiliation."
    });
  };
  return <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
          <Mail className="mr-2 h-4 w-4" />
          Demander la résiliation de mon abonnement
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Demande de résiliation</AlertDialogTitle>
          <AlertDialogDescription>Cette action va ouvrir votre client email pour envoyer une demande de résiliation à notre équipe. 
Votre abonnement restera actif jusqu'à ce que nous traitions votre demande.
Cette demande est gratuite et prendra en compte votre période d'essai si elle est toujours en cours.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancellationRequest} className="bg-destructive hover:bg-destructive/90">
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
};