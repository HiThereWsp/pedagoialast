
import React from "react";
import { RefreshCw } from "lucide-react";

interface RefreshIndicatorProps {
  message?: string;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = React.memo(({ 
  message = "Actualisation des données..." 
}) => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center">
        <RefreshCw className="h-10 w-10 animate-spin text-[#FFA800] mb-4" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
});

RefreshIndicator.displayName = "RefreshIndicator";
