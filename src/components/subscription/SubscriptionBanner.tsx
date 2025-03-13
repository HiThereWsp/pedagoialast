
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SubscriptionBanner = () => {
  const { subscription, loading, isSubscriptionActive, getSubscriptionType } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;

  // Si pas d'abonnement ou abonnement expiré, afficher la bannière d'alerte
  if (!isSubscriptionActive()) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle className="flex items-center">
          <Crown className="h-4 w-4 mr-2" /> Votre accès a expiré
        </AlertTitle>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <AlertDescription>
            Veuillez vous abonner pour continuer à utiliser tous les outils pédagogiques.
          </AlertDescription>
          <Button size="sm" onClick={() => navigate("/pricing")}>
            Voir les offres
          </Button>
        </div>
      </Alert>
    );
  }

  if (!subscription) return null;

  // Afficher une bannière différente selon le type d'abonnement
  switch (subscription.type) {
    case 'beta':
      return (
        <Alert className="mb-4 bg-indigo-50 border-indigo-200">
          <AlertTitle className="flex items-center text-indigo-700">
            <Sparkles className="h-4 w-4 mr-2" /> Accès bêta
          </AlertTitle>
          <AlertDescription className="text-indigo-600">
            Vous bénéficiez d'un accès bêta gratuit jusqu'au 31 décembre 2024. Merci de votre confiance !
          </AlertDescription>
        </Alert>
      );
    
    case 'trial':
      return (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTitle className="flex items-center text-amber-700">
            <CalendarDays className="h-4 w-4 mr-2" /> Période d'essai
          </AlertTitle>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <AlertDescription className="text-amber-600">
              Il vous reste {subscription.daysLeft} jour{subscription.daysLeft !== 1 ? 's' : ''} d'essai gratuit.
            </AlertDescription>
            <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
              S'abonner
            </Button>
          </div>
        </Alert>
      );
    
    case 'paid':
      return (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertTitle className="flex items-center text-green-700">
            <Crown className="h-4 w-4 mr-2" /> Abonnement actif
          </AlertTitle>
          <AlertDescription className="text-green-600">
            Vous bénéficiez de l'accès premium à tous les outils pédagogiques. Merci de votre confiance !
          </AlertDescription>
        </Alert>
      );
    
    default:
      return null;
  }
};
