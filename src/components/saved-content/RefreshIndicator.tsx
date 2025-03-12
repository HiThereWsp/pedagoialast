
import React from "react";
import { RefreshCw } from "lucide-react";

interface RefreshIndicatorProps {
  message?: string;
  isError?: boolean;
  waitTime?: number;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = React.memo(({ 
  message = "Actualisation des données en cours...",
  isError = false,
  waitTime = 0
}) => {
  // Afficher un message différent selon le temps d'attente
  const getWaitMessage = () => {
    if (waitTime > 5) {
      return "Cette opération prend plus de temps que prévu...";
    } else if (waitTime > 3) {
      return "Patientez encore quelques instants...";
    }
    return "Patientez quelques instants...";
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center">
        <RefreshCw 
          className={`h-10 w-10 animate-spin ${isError ? 'text-red-500' : 'text-[#FFA800]'} mb-4`} 
        />
        <p className={`font-medium ${isError ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{getWaitMessage()}</p>
        {waitTime > 6 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 max-w-md text-center">
            Si le chargement persiste, essayez de rafraîchir la page ou de vous reconnecter.
          </p>
        )}
      </div>
    </div>
  );
});

RefreshIndicator.displayName = "RefreshIndicator";
