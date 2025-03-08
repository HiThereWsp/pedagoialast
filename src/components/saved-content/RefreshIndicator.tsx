
import React from "react";
import { RefreshCw } from "lucide-react";

interface RefreshIndicatorProps {
  message?: string;
  isError?: boolean;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = React.memo(({ 
  message = "Actualisation des données en cours...",
  isError = false
}) => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center">
        <RefreshCw 
          className={`h-10 w-10 animate-spin ${isError ? 'text-red-500' : 'text-[#FFA800]'} mb-4`} 
        />
        <p className={`font-medium ${isError ? 'text-red-500' : 'text-gray-500'}`}>{message}</p>
        <p className="text-sm text-gray-400 mt-2">Patientez quelques instants...</p>
      </div>
    </div>
  );
});

RefreshIndicator.displayName = "RefreshIndicator";
