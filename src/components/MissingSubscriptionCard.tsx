
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface MissingSubscriptionCardProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
}

export const MissingSubscriptionCard = ({
  title = "Accès restreint",
  description = "Cette fonctionnalité nécessite un abonnement actif. Veuillez vous abonner pour y accéder.",
  actionText = "Voir les offres d'abonnement",
  actionLink = "/pricing"
}: MissingSubscriptionCardProps) => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  
  let message = description;
  
  // Personnaliser le message selon le type d'abonnement
  if (subscription) {
    if (subscription.type === 'trial') {
      message = `Votre période d'essai est terminée. Abonnez-vous pour continuer à utiliser tous nos outils pédagogiques.`;
    } else if (subscription.type === 'paid') {
      message = `Votre abonnement a expiré. Renouvelez-le pour continuer à bénéficier de tous nos outils pédagogiques.`;
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary/10">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base mt-2">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium">Avec un abonnement, vous bénéficiez de :</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-0.5" />
              <span>Tous les outils pédagogiques IA sans limitation</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-0.5" />
              <span>Un gain de temps de plus de 14h par semaine</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-0.5" />
              <span>Des mises à jour régulières de nos fonctionnalités</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-6">
        <Button 
          className="w-full"
          onClick={() => navigate(actionLink)}
          size="lg"
        >
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  );
};
