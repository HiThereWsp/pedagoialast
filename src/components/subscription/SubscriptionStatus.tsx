
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center h-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Vérification de l'abonnement...</span>
      </Card>
    );
  }
  
  if (!isSubscribed) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Abonnement requis</h3>
        <p className="text-muted-foreground mb-4">
          Vous n'avez pas d'abonnement actif. Découvrez nos offres pour profiter de toutes les fonctionnalités.
        </p>
        <Button onClick={() => navigate("/pricing")}>
          Voir les abonnements
        </Button>
      </Card>
    );
  }
  
  const getPlanName = () => {
    switch (subscriptionType) {
      case 'monthly':
        return 'Abonnement Mensuel';
      case 'yearly':
        return 'Abonnement Annuel';
      case 'trial':
        return 'Période d\'Essai';
      case 'beta':
        return 'Accès Beta';
      default:
        return 'Abonnement Actif';
    }
  };
  
  const formatExpiryDate = () => {
    if (!expiresAt) return 'Date inconnue';
    
    try {
      const date = new Date(expiresAt);
      return format(date, 'PPP', { locale: fr });
    } catch (e) {
      console.error('Erreur format date:', e);
      return expiresAt;
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{getPlanName()}</h3>
        <Badge variant={subscriptionType === 'beta' ? 'outline' : 'default'} className="bg-green-100 text-green-800 hover:bg-green-100">
          Actif
        </Badge>
      </div>
      
      {expiresAt && (
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Valide jusqu'au {formatExpiryDate()}
        </div>
      )}
      
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
          Gérer l'abonnement
        </Button>
      </div>
    </Card>
  );
}
