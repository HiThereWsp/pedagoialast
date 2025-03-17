
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function SubscriptionLoading() {
  return (
    <Card className="p-4 flex items-center justify-center h-24">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Vérification de l'abonnement...</span>
    </Card>
  );
}
