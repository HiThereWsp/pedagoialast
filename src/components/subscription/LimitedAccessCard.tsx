import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export function LimitedAccessCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  
  // Déclencher la redirection après un délai
  useEffect(() => {
    // Si l'utilisateur est abonné, ne pas rediriger
    if (isSubscribed) {
      return;
    }

    const timer = setTimeout(() => {
      // Si l'utilisateur est connecté, rediriger vers /pricing
      // Sinon, rediriger vers /login avec un paramètre de redirection
      if (user) {
        navigate('/pricing');
      } else {
        navigate('/login?redirect=/pricing');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, user, isSubscribed]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo avec animation de pulse */}
        <div className="mb-8 logo-entrance">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
            alt="PedagoIA" 
            className="h-32 w-auto mx-auto animate-pulse" 
          />
        </div>

        {/* Message avec animation de fade-in */}
        <div className="space-y-4 animate-fade-in">
          <p className="text-xl font-medium text-gray-900">
            Cette fonctionnalité nécessite un accès payant
          </p>
          <p className="text-sm text-gray-500">
            {user ? 
              "Redirection vers les offres d'abonnement..." :
              "Redirection vers la page de connexion..."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
