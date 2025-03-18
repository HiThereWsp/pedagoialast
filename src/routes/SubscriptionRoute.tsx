
import { useEffect, useState, useRef } from "react";
import { useSubscription } from "@/hooks/subscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { user } = useAuth();
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const checkCount = useRef(0);
  const [showContent, setShowContent] = useState(false);
  
  // Liste des utilisateurs spéciaux qui ont accès même en cas de problème
  const specialUsers = [
    'andyguitteaud@gmail.co',
    'andyguitteaud@gmail.com',
    'ag.tradeunion@gmail.com'
  ];
  
  // Vérifier si c'est un utilisateur spécial
  useEffect(() => {
    if (user?.email && specialUsers.includes(user.email)) {
      console.log("[DEBUG] Utilisateur spécial détecté dans SubscriptionRoute, affichage forcé du contenu:", user.email);
      setShowContent(true);
    }
  }, [user]);
  
  // Si c'est un utilisateur spécial, afficher directement le contenu
  if (showContent) {
    return children;
  }
  
  // Réduire le temps d'affichage de la vérification - seulement montrer l'indicateur si ça prend trop longtemps
  useEffect(() => {
    if (isLoading) {
      // Afficher l'indicateur de chargement seulement après un délai substantiel (2 secondes)
      const timer = setTimeout(() => setIsChecking(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [isLoading]);
  
  // Limiter le nombre de vérifications pour éviter les boucles
  useEffect(() => {
    if (isLoading && checkCount.current < 3) {
      checkCount.current += 1;
    }
  }, [isLoading]);

  // En développement, toujours afficher le contenu
  if (import.meta.env.DEV) {
    console.log("Mode développement détecté, bypass de la vérification d'abonnement");
    return children;
  }
  
  // Pour les utilisateurs spécifiques, bypass la vérification d'abonnement
  const shouldBypassCheck = () => {
    if (user?.email) {
      return specialUsers.includes(user.email);
    }
    return false;
  };
  
  if (shouldBypassCheck()) {
    console.log("Utilisateur spécial détecté, bypass de la vérification d'abonnement");
    return children;
  }
  
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification de l'abonnement en cours...");
    
    try {
      await checkSubscription(true); // Force refresh
      toast.success("Vérification terminée");
    } catch (e) {
      toast.error("La vérification a échoué");
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Déterminer si l'utilisateur est un possible utilisateur beta connu
  const isPossibleBetaUser = (): boolean => {
    try {
      // Si le type d'abonnement est déjà 'beta', c'est vrai
      if (subscriptionType === 'beta' || subscriptionType === 'beta_pending') return true;
      
      // Vérifier si l'utilisateur a un email connu en beta
      if (user?.email) {
        const betaEmails = specialUsers;
        if (betaEmails.includes(user.email)) return true;
      }
      
      // Vérifier si l'URL contient des paramètres qui pourraient indiquer un statut beta
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('beta') || urlParams.has('betaAccess')) return true;
      
      return false;
    } catch (e) {
      return false;
    }
  };
  
  // Si l'utilisateur est un possible beta, afficher le contenu même en cas d'erreur
  if (error && isPossibleBetaUser()) {
    console.log("Possible beta user detected, showing content despite error");
    return children;
  }
  
  // Si le nombre de vérifications est trop élevé, afficher le contenu pour éviter les boucles
  if (checkCount.current >= 3) {
    console.log("Maximum check count reached, showing content to avoid loops");
    return children;
  }
  
  // Afficher un message spécial pour les utilisateurs beta en attente de validation
  if (subscriptionType === 'beta_pending') {
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-yellow-50 border-yellow-200 mb-6">
          <Info className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800 font-medium">Accès Beta en attente</AlertTitle>
          <AlertDescription className="text-yellow-700">
            En tant qu'utilisateur Beta, vous bénéficiez d'un accès gratuit. 
            Écrivez "Accès Beta" à l'adresse <a href="mailto:bonjour@pedagoia.fr" className="font-semibold underline">bonjour@pedagoia.fr</a> pour en savoir plus.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.href = '/tableau-de-bord'}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }
  
  // En mode dev ou pendant les vérifications courtes, ne pas afficher de chargement
  if (isLoading && isChecking && !import.meta.env.DEV) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] transition-opacity duration-300">
        <div className="text-center">
          <LoadingIndicator type="spinner" size="md" />
          <p className="text-muted-foreground mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
  
  // Si une erreur est survenue, afficher un message avec l'option de réessayer
  if (error) {
    console.error('Subscription verification error:', error);
    
    // En développement, autoriser l'accès malgré l'erreur
    if (import.meta.env.DEV) {
      console.log('Mode développement détecté, accès accordé malgré l\'erreur');
      return children;
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-medium">Erreur de vérification d'abonnement</AlertTitle>
          <AlertDescription className="text-red-700">
            Une erreur est survenue lors de la vérification de votre abonnement. 
            Vous pouvez essayer de réactualiser ou contacter notre support si le problème persiste.
          </AlertDescription>
        </Alert>
        
        <details className="mb-6 text-xs text-gray-600">
          <summary className="cursor-pointer font-medium">Détails techniques</summary>
          <p className="mt-1 p-2 bg-gray-100 rounded">{error}</p>
        </details>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outline"
          >
            {isRetrying ? (
              <>
                <LoadingIndicator size="sm" type="spinner" className="mr-2" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </>
            )}
          </Button>
          <Button onClick={() => window.location.href = '/contact'}>
            Contacter le support
          </Button>
        </div>
      </div>
    );
  }
  
  // Si pas d'abonnement actif, rediriger vers la page pricing avec un message clair
  if (!isSubscribed) {
    // Log in PostHog for analytics, but only in production
    if (!import.meta.env.DEV) {
      posthog.capture('subscription_required_view', {
        current_path: window.location.pathname,
        subscription_type: subscriptionType
      });
    }
    
    // Rediriger automatiquement vers la page d'abonnement après un court délai
    useEffect(() => {
      const redirectTimer = setTimeout(() => {
        window.location.href = '/pricing';
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }, []);
    
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <Info className="h-5 w-5 text-amber-800" />
          <AlertTitle className="text-amber-800 font-medium">Accès limité</AlertTitle>
          <AlertDescription className="text-amber-700">
            Abonnez vous pour avoir accès à toutes les fonctionnalités de PedagoIA.
            <div className="mt-2">Redirection vers la page d'abonnement...</div>
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.href = '/pricing'}>
            Voir les offres d'abonnement
          </Button>
        </div>
      </div>
    );
  }
  
  // L'utilisateur a un abonnement valide, afficher le contenu
  return children;
};
