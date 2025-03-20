
import { RefreshCw, AlertTriangle, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionErrorProps {
  error: string;
  isRetrying: boolean;
  onRetry: () => void;
  onRepair?: () => void;
  showRepair?: () => Promise<boolean>;
  isRepairing?: boolean;
}

export function SubscriptionError({ 
  error, 
  isRetrying, 
  onRetry,
  onRepair,
  showRepair,
  isRepairing = false
}: SubscriptionErrorProps) {
  const [showRepairButton, setShowRepairButton] = useState(false);
  
  // Check if repair button should be shown
  useEffect(() => {
    const checkRepairEligibility = async () => {
      if (showRepair) {
        try {
          const eligible = await showRepair();
          setShowRepairButton(eligible);
        } catch (e) {
          console.error("Error checking repair eligibility:", e);
          setShowRepairButton(false);
        }
      } else {
        // By default, show repair option for subscription errors
        setShowRepairButton(true);
      }
    };
    
    checkRepairEligibility();
  }, [showRepair]);

  // Default repair function if none is provided
  const handleDefaultRepair = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("No authenticated user found for repair");
        toast.error("Aucun utilisateur connecté trouvé");
        return;
      }
      
      toast.info("Tentative de réparation de l'abonnement...");
      
      const { data, error } = await supabase.functions.invoke('repair-user-subscription', {
        body: { 
          userId: session.user.id,
          email: session.user.email
        }
      });
      
      if (error) {
        console.error("Error repairing subscription:", error);
        toast.error("Échec de la réparation: " + error.message);
      } else {
        console.log("Repair result:", data);
        toast.success("Réparation réussie! Actualisation en cours...");
        
        // Call onRetry to refresh subscription status
        if (onRetry) {
          setTimeout(onRetry, 1000);
        }
      }
    } catch (e) {
      console.error("Error invoking repair function:", e);
      toast.error("Erreur lors de la réparation: " + e.message);
    }
  };

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
          onClick={onRetry} 
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

        {/* Show repair button only for eligible users */}
        {showRepairButton && (
          <Button 
            onClick={onRepair || handleDefaultRepair}
            disabled={isRepairing}
            variant="outline"
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            {isRepairing ? (
              <>
                <LoadingIndicator size="sm" type="spinner" className="mr-2" />
                <span>Réparation...</span>
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Réparer l'abonnement
              </>
            )}
          </Button>
        )}
        
        <Button onClick={() => window.location.href = '/contact'}>
          Contacter le support
        </Button>
      </div>
    </div>
  );
}
