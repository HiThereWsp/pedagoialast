
import { Helmet } from "react-helmet-async";
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ActionButtons } from "@/components/home/ActionButtons";
import { Footer } from "@/components/home/Footer";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BetaWelcomeNotification } from "@/components/beta/BetaWelcomeNotification";

const TableauDeBord = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
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
      
      <div className="min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
        <BetaWelcomeNotification />
        <WelcomeMessage firstName={firstName} />
        <ActionButtons />
        <Footer />
      </div>
    </DashboardWrapper>
  );
};

export default TableauDeBord;
