
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Chargement en cours...",
  submessage,
  size = "md"
}) => {
  const getSize = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-10 w-10";
      default: return "h-6 w-6";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className={`${getSize()} animate-spin text-primary mb-3`} />
      {message && (
        <p className="text-muted-foreground font-medium">{message}</p>
      )}
      {submessage && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{submessage}</p>
      )}
    </div>
  );
};
