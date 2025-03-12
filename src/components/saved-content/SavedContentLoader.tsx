
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
      <div className="relative">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-full animate-pulse" />
      </div>
      <p className="text-lg font-medium text-muted-foreground mt-6">{message}</p>
    </div>
  );
};
