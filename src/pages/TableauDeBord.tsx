
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BetaWelcomeNotification } from "@/components/beta/BetaWelcomeNotification";
import { useAuth } from "@/hooks/useAuth";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { WelcomeMessage } from "@/components/home/WelcomeMessage";

const TableauDeBord = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsProfileLoading(true);
        
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (profile) {
          setFirstName(profile.first_name);
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  return (
    <DashboardWrapper>
      <Helmet>
        <title>Tableau de bord | PedagoIA</title>
        <meta name="description" content="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé." />
      </Helmet>
      
      {/* Beta Welcome Notification */}
      <BetaWelcomeNotification />
      
      {/* Contenu principal simplifié */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <WelcomeMessage firstName={firstName} />
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default TableauDeBord;
