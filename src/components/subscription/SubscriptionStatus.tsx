
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Star } from "lucide-react";
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
        <h3 className="text-lg sm:text-xl font-semibold mb-3 leading-tight tracking-tight text-balance">
          Abonnement requis
        </h3>
        <p className="text-muted-foreground mb-4 max-w-lg">
          Vous n'avez pas d'abonnement actif. Découvrez nos offres pour profiter de toutes les fonctionnalités.
        </p>
        <Button onClick={() => navigate("/pricing")} className="w-full sm:w-auto">
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
  
  const getBadgeVariant = () => {
    if (subscriptionType === 'beta') {
      return 'secondary';
    }
    return 'default';
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
  
  const renderIcon = () => {
    if (subscriptionType === 'beta') {
      return <Star className="h-4 w-4 mr-1 text-yellow-500" />;
    }
    return null;
  };
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-xl sm:text-2xl font-bold flex items-center leading-tight tracking-tight text-balance">
          {renderIcon()}
          <span className={subscriptionType === 'beta' ? 'underline decoration-dashed underline-offset-4' : ''}>
            {getPlanName()}
          </span>
        </h3>
        <Badge variant={getBadgeVariant()} className={
          subscriptionType === 'beta' 
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-medium rotate-1 self-start" 
            : "bg-green-100 text-green-800 hover:bg-green-100"
        }>
          {subscriptionType === 'beta' ? "Accès Beta" : "Actif"}
        </Badge>
      </div>
      
      {expiresAt && (
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Valide jusqu'au <span className="font-medium ml-1">{formatExpiryDate()}</span>
        </div>
      )}
      
      {subscriptionType === 'beta' && (
        <p className="text-sm text-muted-foreground mb-4">
          Vous bénéficiez d'un accès privilégié à toutes les fonctionnalités. Merci de votre participation au programme beta !
        </p>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        {subscriptionType !== 'beta' && (
          <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
            Gérer l'abonnement
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate("/contact")}>
          Support
        </Button>
      </div>
    </Card>
  );
}
