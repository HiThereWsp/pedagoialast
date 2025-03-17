
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function LimitedAccessCard() {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6">
      <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-tight tracking-tight text-balance">
        Accès limité
      </h3>
      <p className="text-muted-foreground mb-4 max-w-lg">
        Merci de vous être inscrit à PedagoIA. Vous avez actuellement un accès limité à la plateforme. 
        Découvrez nos offres pour bénéficier de toutes les fonctionnalités.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button onClick={() => navigate("/pricing")} className="w-full sm:w-auto">
          Voir les abonnements
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/tableau-de-bord")} 
          className="w-full sm:w-auto">
          Explorer la plateforme
        </Button>
      </div>
    </Card>
  );
}
