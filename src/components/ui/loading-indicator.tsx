
import React from "react";

type LoadingIndicatorProps = {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
};

export const LoadingIndicator = ({ message, submessage, size = "md" }: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-center text-sm font-medium text-muted-foreground">
          {message}
        </p>
      )}
      {submessage && (
        <p className="text-center text-xs text-muted-foreground">
          {submessage}
        </p>
      )}
    </div>
  );
};
