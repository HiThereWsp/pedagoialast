
import { AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SaveErrorAlertProps {
  error: string | null;
  isSaving: boolean;
  onRetry: () => void;
}

export function SaveErrorAlert({ error, isSaving, onRetry }: SaveErrorAlertProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Erreur lors de la sauvegarde : {error}
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4" 
          onClick={onRetry}
          disabled={isSaving}
        >
          {isSaving ? "Sauvegarde..." : "Réessayer"} <Save className="h-4 w-4 ml-2" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
