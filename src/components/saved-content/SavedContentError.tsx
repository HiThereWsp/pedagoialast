
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/settings/BackButton";

interface SavedContentErrorProps {
  error: string;
  onRetry?: () => Promise<void>;
}

export const SavedContentError: React.FC<SavedContentErrorProps> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      
      <Card className="p-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300">
            {error || "Une erreur est survenue lors du chargement de vos contenus. Veuillez réessayer ultérieurement."}
          </p>
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2 border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
