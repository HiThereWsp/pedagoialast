import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BugReportButton = () => {
  // Fonction pour ouvrir un mail
  const handleSendEmail = () => {
    const subject = encodeURIComponent("Signalement de bug - PedagoIA");
    const body = encodeURIComponent(
      "Détails du bug :\n\n" +
      "1. Description du problème :\n\n" +
      "2. Étapes pour reproduire :\n\n" +
      "3. Où le problème s'est-il produit (page/fonctionnalité) :\n\n" +
      "4. Informations supplémentaires :"
    );
    
    window.location.href = `mailto:support@pedagoia.io?subject=${subject}&body=${body}`;
  };

  return (
    <Button 
      onClick={handleSendEmail} 
      aria-label="Signaler un bug" 
      variant="secondary" 
      className="fixed bottom-4 right-4 z-50 p-3 shadow-lg rounded-3xl bg-slate-900 hover:bg-slate-800"
    >
      <AlertCircle className="h-5 w-5 text-white" />
    </Button>
  );
};