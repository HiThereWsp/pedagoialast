
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Star, Sparkles, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error } = useSubscription();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center h-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Vérification de l'abonnement...</span>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-red-800 leading-tight tracking-tight text-balance">
          Erreur de vérification
        </h3>
        <p className="text-red-700 mb-4 max-w-lg">
          Une erreur est survenue lors de la vérification de votre abonnement. Veuillez réessayer ultérieurement.
        </p>
        <details className="mb-4 text-xs text-red-600">
          <summary>Détails techniques</summary>
          <p className="mt-1">{error}</p>
        </details>
        <Button onClick={() => navigate("/contact")} variant="outline" className="border-red-300 text-red-800 hover:bg-red-100">
          Contacter le support
        </Button>
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
  
  // Déterminer le type d'abonnement et l'affichage correspondant
  const subscriptionInfo = getSubscriptionInfo(subscriptionType);
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-xl sm:text-2xl font-bold flex items-center leading-tight tracking-tight text-balance">
          {subscriptionInfo.icon}
          <span className={subscriptionInfo.titleStyle}>
            {subscriptionInfo.title}
          </span>
        </h3>
        <Badge variant={subscriptionInfo.badgeVariant} className={subscriptionInfo.badgeStyle}>
          {subscriptionInfo.badgeText}
        </Badge>
      </div>
      
      {expiresAt && (
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Valide jusqu'au <span className="font-medium ml-1">{formatExpiryDate(expiresAt)}</span>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        {subscriptionInfo.description}
      </p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {subscriptionInfo.showManageButton && (
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

// Fonction pour formater la date d'expiration
function formatExpiryDate(dateStr: string) {
  if (!dateStr) return 'Date inconnue';
  
  try {
    const date = new Date(dateStr);
    return format(date, 'PPP', { locale: fr });
  } catch (e) {
    console.error('Erreur format date:', e);
    return dateStr;
  }
}

// Fonction pour obtenir les informations d'affichage selon le type d'abonnement
function getSubscriptionInfo(type: string | null) {
  switch (type) {
    case 'beta':
      return {
        title: 'Accès Beta',
        description: 'Vous bénéficiez d'un accès privilégié à toutes les fonctionnalités en tant que testeur beta. Merci de votre participation au programme beta !',
        icon: <Star className="h-4 w-4 mr-2 text-yellow-500" />,
        titleStyle: 'underline decoration-dashed underline-offset-4 decoration-yellow-400',
        badgeVariant: 'secondary' as const,
        badgeText: 'Bêta',
        badgeStyle: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-medium rotate-1 self-start',
        showManageButton: false
      };
    
    case 'trial':
      return {
        title: 'Période d\'Essai',
        description: 'Vous profitez actuellement d\'une période d\'essai avec accès à toutes les fonctionnalités premium. Découvrez tous les avantages avant de choisir un abonnement.',
        icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Essai',
        badgeStyle: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        showManageButton: true
      };
    
    case 'paid':
    case 'monthly':
    case 'yearly':
      return {
        title: type === 'yearly' ? 'Abonnement Annuel' : 'Abonnement Mensuel',
        description: 'Vous bénéficiez d\'un accès complet à toutes les fonctionnalités premium de PedagoIA. Merci pour votre soutien !',
        icon: <Sparkles className="h-4 w-4 mr-2 text-green-500" />,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Premium',
        badgeStyle: 'bg-green-100 text-green-800 hover:bg-green-100',
        showManageButton: true
      };
    
    case 'dev_mode':
      return {
        title: 'Mode Développement',
        description: 'Vous êtes en mode développement avec un accès complet à toutes les fonctionnalités.',
        icon: null,
        titleStyle: '',
        badgeVariant: 'outline' as const,
        badgeText: 'Dev',
        badgeStyle: '',
        showManageButton: false
      };
    
    default:
      return {
        title: 'Abonnement Actif',
        description: 'Vous avez accès à toutes les fonctionnalités de PedagoIA.',
        icon: null,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Actif',
        badgeStyle: 'bg-green-100 text-green-800 hover:bg-green-100',
        showManageButton: true
      };
  }
}
