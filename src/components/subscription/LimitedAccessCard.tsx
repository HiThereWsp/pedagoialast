
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LimitedAccessCard() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto p-6 my-8">
      <Alert className="bg-amber-50 border-amber-200 mb-6">
        <Info className="h-5 w-5 text-amber-800" />
        <AlertTitle className="text-amber-800 font-medium">Accès limité</AlertTitle>
        <AlertDescription className="text-amber-700">
          Abonnez vous pour avoir accès à toutes les fonctionnalités de PedagoIA.
          <div className="mt-2">Redirection vers la page d'abonnement...</div>
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={() => navigate('/pricing')}>
          Voir les offres d'abonnement
        </Button>
      </div>
    </div>
  );
}
