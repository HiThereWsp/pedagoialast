
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface SubscriptionErrorProps {
  error: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function SubscriptionError({ error, isRetrying, onRetry }: SubscriptionErrorProps) {
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
        <Button onClick={() => window.location.href = '/contact'}>
          Contacter le support
        </Button>
      </div>
    </div>
  );
}
