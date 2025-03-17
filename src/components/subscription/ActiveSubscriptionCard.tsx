
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatExpiryDate } from "./utils";

interface SubscriptionInfoDisplay {
  title: string;
  description: string;
  icon: React.ReactNode | null;
  titleStyle: string;
  badgeVariant: "default" | "secondary" | "outline";
  badgeText: string;
  badgeStyle: string;
  showManageButton: boolean;
}

interface ActiveSubscriptionCardProps {
  subscriptionInfo: SubscriptionInfoDisplay;
  expiresAt: string | null;
  isRetrying: boolean;
  onRetry: () => void;
}

export function ActiveSubscriptionCard({
  subscriptionInfo,
  expiresAt,
  isRetrying,
  onRetry
}: ActiveSubscriptionCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-xl sm:text-2xl font-bold flex items-center leading-tight tracking-tight text-balance">
          {subscriptionInfo.icon}
          <span className={subscriptionInfo.titleStyle}>
            {subscriptionInfo.title}
          </span>
        </h3>
        <Badge variant={subscriptionInfo.badgeVariant} className={subscriptionInfo.badgeStyle}>
          {subscriptionInfo.badgeText}
        </Badge>
      </div>
      
      {expiresAt && (
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Valide jusqu'au <span className="font-medium ml-1">{formatExpiryDate(expiresAt)}</span>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        {subscriptionInfo.description}
      </p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {subscriptionInfo.showManageButton && (
          <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
            Gérer l'abonnement
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate("/contact")}>
          Support
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-auto"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualiser
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
