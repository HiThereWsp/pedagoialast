
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface SubscriptionErrorProps {
  error: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function SubscriptionError({ error, isRetrying, onRetry }: SubscriptionErrorProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <h3 className="text-xl sm:text-2xl font-bold mb-3 text-red-800 leading-tight tracking-tight text-balance flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
        Erreur de vérification
      </h3>
      <p className="text-red-700 mb-4 max-w-lg">
        Une erreur est survenue lors de la vérification de votre abonnement.
      </p>
      
      <details className="mb-4 text-xs text-red-600">
        <summary className="cursor-pointer font-medium">Détails techniques</summary>
        <p className="mt-1 p-2 bg-red-100 rounded">{error}</p>
      </details>
      
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-red-800">Essayez ces solutions :</p>
        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
          <li>Rafraîchissez la page</li>
          <li>Déconnectez-vous puis reconnectez-vous</li>
          <li>Videz le cache de votre navigateur</li>
        </ul>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="border-red-300 text-red-800 hover:bg-red-100"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Réessayer
            </>
          )}
        </Button>
        
        <Button 
          onClick={() => navigate("/contact")} 
          variant="outline" 
          className="border-red-300 text-red-800 hover:bg-red-100"
        >
          Contacter le support
        </Button>
      </div>
    </Card>
  );
}
