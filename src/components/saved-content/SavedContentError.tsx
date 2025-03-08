
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SavedContentErrorProps {
  error: string;
  onRetry?: () => void;
}

export const SavedContentError = ({ error, onRetry }: SavedContentErrorProps) => {
  return (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
        </div>
        
        <p className="text-gray-700">{error || "Une erreur est survenue lors du chargement de vos contenus. Veuillez réessayer ultérieurement."}</p>
        
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2 border-red-300 text-red-600 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        )}
      </div>
    </Card>
  );
};
