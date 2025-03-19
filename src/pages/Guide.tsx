
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { fixAmbassadorSubscription } from '@/utils/ambassadorUtils';

const Guide = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [email, setEmail] = useState('');
  
  const handleAdminRepair = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une adresse e-mail",
        duration: 3000,
      });
      return;
    }
    
    setIsRepairing(true);
    try {
      const result = await fixAmbassadorSubscription(email);
      
      if (result.success) {
        toast({
          title: "Réparation réussie",
          description: result.message,
          duration: 5000,
        });
        setEmail('');
      } else {
        toast({
          variant: "destructive",
          title: "Échec de la réparation",
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la réparation",
        duration: 5000,
      });
      console.error("Repair error:", error);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">Guide d'utilisation</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Bienvenue sur PedagoIA</h2>
        <p className="text-gray-700 mb-4">
          Ce guide vous aidera à tirer le meilleur parti de votre expérience avec PedagoIA.
        </p>
        
        {/* Contenu du guide ici */}
        <div className="space-y-6">
          <section className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-2">Démarrer avec PedagoIA</h3>
            <p>Découvrez les fonctionnalités essentielles pour commencer.</p>
          </section>
          
          <section className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-2">Création d'exercices</h3>
            <p>Apprenez à créer des exercices personnalisés pour vos élèves.</p>
          </section>
          
          <section className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-2">Plans de cours</h3>
            <p>Découvrez comment créer des plans de cours efficaces.</p>
          </section>
        </div>
      </div>
      
      {/* Admin section for repair */}
      <div className="mt-16 p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Réparation d'accès ambassadeur</h2>
        <p className="mb-4 text-sm">
          Cet outil permet de réparer l'accès ambassadeur pour un utilisateur dont le webhook Stripe aurait échoué.
        </p>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email de l'utilisateur</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@domaine.com"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <Button 
            onClick={handleAdminRepair}
            disabled={isRepairing || !email}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isRepairing ? "Réparation en cours..." : "Réparer l'accès"}
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Note: Cet outil ne fonctionne que pour les utilisateurs ayant complété un paiement sur Stripe.
        </p>
      </div>
    </div>
  );
};

export default Guide;
