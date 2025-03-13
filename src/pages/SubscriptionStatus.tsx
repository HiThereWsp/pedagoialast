
import { useSubscription } from "@/hooks/useSubscription";
import { SEO } from "@/components/SEO";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ShieldCheck, Clock, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MissingSubscriptionCard } from "@/components/MissingSubscriptionCard";

const SubscriptionStatus = () => {
  const { subscription, loading, error, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator message="Chargement des informations d'abonnement..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <SEO 
          title="Erreur - Statut d'abonnement | PedagoIA"
          description="Une erreur est survenue lors du chargement des informations d'abonnement."
        />
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">
            Une erreur est survenue lors du chargement des informations d'abonnement. 
            Veuillez réessayer ultérieurement.
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
  if (!subscription || !isSubscriptionActive()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <SEO 
          title="Abonnement inactif | PedagoIA"
          description="Votre abonnement est inactif ou a expiré. Découvrez nos offres pour profiter de tous les avantages."
        />
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Statut d'abonnement</h1>
          <MissingSubscriptionCard />
        </div>
      </div>
    );
  }
  
  // Formater la date d'expiration
  const expiresAt = new Date(subscription.expiresAt);
  const formattedExpirationDate = format(expiresAt, 'dd MMMM yyyy', { locale: fr });
  
  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title="Statut d'abonnement | PedagoIA"
        description="Consultez les détails de votre abonnement PedagoIA et gérez vos préférences."
      />
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Statut d'abonnement</h1>
        
        <Card className="mb-8 shadow-lg border-2 border-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {subscription.type === 'beta' && "Accès Bêta"}
                  {subscription.type === 'trial' && "Période d'essai"}
                  {subscription.type === 'paid' && "Abonnement Premium"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {subscription.type === 'beta' && "Accès anticipé aux fonctionnalités"}
                  {subscription.type === 'trial' && "Essai gratuit de tous les outils"}
                  {subscription.type === 'paid' && "Accès complet à tous les outils"}
                </CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                {subscription.type === 'beta' && <ShieldCheck className="h-7 w-7 text-primary" />}
                {subscription.type === 'trial' && <Clock className="h-7 w-7 text-primary" />}
                {subscription.type === 'paid' && <Crown className="h-7 w-7 text-primary" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-muted-foreground">Statut</span>
              <span className="font-medium">
                {subscription.status === 'active' ? (
                  <span className="text-green-600 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                    Actif
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                    Expiré
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Date d'expiration</span>
              </div>
              <span className="font-medium">
                {formattedExpirationDate}
              </span>
            </div>
            
            {subscription.type === 'trial' && subscription.daysLeft !== undefined && (
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Jours restants</span>
                <span className="font-medium">{subscription.daysLeft} jour{subscription.daysLeft !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {subscription.type === 'paid' && subscription.stripeSubscriptionId && (
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">ID d'abonnement</span>
                <span className="font-medium text-sm text-muted-foreground">{subscription.stripeSubscriptionId}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {subscription.type === 'beta' && (
              <p className="text-sm text-muted-foreground text-center">
                En tant que bêta-testeur, vous bénéficiez d'un accès gratuit jusqu'au 31 décembre 2024.
                Merci de votre participation au développement de PedagoIA !
              </p>
            )}
            
            {subscription.type === 'trial' && (
              <Button 
                className="w-full" 
                onClick={() => navigate("/pricing")}
              >
                Passer à un abonnement premium
              </Button>
            )}
            
            {subscription.type === 'paid' && (
              <div className="w-full space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open('https://billing.stripe.com/p/login/dR63fH75Q0hn9uo5kk', '_blank')}
                >
                  Gérer mon abonnement
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  La gestion de votre abonnement se fait via le portail client Stripe.
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
