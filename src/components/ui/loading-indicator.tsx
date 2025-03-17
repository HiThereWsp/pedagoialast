
import React from "react";
import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
  type?: "spinner" | "dots" | "progress";
  className?: string;
};

export const LoadingIndicator = ({ 
  message, 
  submessage, 
  size = "md", 
  type = "spinner", 
  className 
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Rendu conditionnel selon le type d'indicateur choisi
  const renderLoadingIndicator = () => {
    switch (type) {
      case "dots":
        return (
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <div 
                key={dot}
                className={cn(
                  "rounded-full bg-primary", 
                  sizeClasses[size] === "h-4 w-4" ? "h-2 w-2" : 
                  sizeClasses[size] === "h-8 w-8" ? "h-3 w-3" : "h-4 w-4",
                  "animate-pulse"
                )}
                style={{ animationDelay: `${dot * 150}ms` }}
              />
            ))}
          </div>
        );
      case "progress":
        return (
          <div className={cn("w-full max-w-xs bg-gray-200 rounded-full overflow-hidden", className)}>
            <div 
              className="bg-primary h-2 rounded-full animate-pulse"
              style={{ width: '75%' }}
            />
          </div>
        );
      case "spinner":
      default:
        return (
          <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size])}></div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      {renderLoadingIndicator()}
      
      {message && (
        <p className="text-center text-sm font-medium text-muted-foreground text-balance">
          {message}
        </p>
      )}
      
      {submessage && (
        <p className="text-center text-xs text-muted-foreground tracking-tight text-balance">
          {submessage}
        </p>
      )}
    </div>
  );
};
