import { SparklesText } from "@/components/ui/sparkles-text";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { LoginDialog } from "@/components/landing/auth/LoginDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogIn, LayoutDashboard } from "lucide-react";

export const PricingHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto text-center mb-16">
      {user && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate('/tableaudebord')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tableau de bord
          </Button>
        </div>
      )}
      <div className="text-5xl font-extrabold mb-4 leading-tight tracking-tight text-balance">
        <SparklesText 
          text="La magie de l'Intelligence Artificielle" 
          className="text-4xl sm:text-5xl font-extrabold mb-1"
          sparklesCount={15}
          colors={{ first: "#9E7AFF", second: "#D946EF" }}
        />
        <div className="mt-2">au service de l'enseignement</div>
      </div>
      <p className="text-xl text-muted-foreground max-w-lg mx-auto mt-6">
        Choisissez le plan qui vous convient le mieux
      </p>
    </div>
  );
};
