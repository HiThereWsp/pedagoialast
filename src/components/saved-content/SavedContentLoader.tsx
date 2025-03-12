
import React from "react";
import { Loader2 } from "lucide-react";

interface SavedContentLoaderProps {
  message?: string;
}

export const SavedContentLoader: React.FC<SavedContentLoaderProps> = ({ 
  message = "Chargement en cours..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-lg text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};
