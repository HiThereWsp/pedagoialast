import React from 'react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import {FunctionsFetchError, FunctionsHttpError, FunctionsRelayError, User} from "@supabase/supabase-js"
import { HomeSkeleton } from "@/components/home/HomeSkeleton"
import { WelcomeMessage } from "@/components/home/WelcomeMessage"
import { ActionButtons } from "@/components/home/ActionButtons"
import { Footer } from "@/components/home/Footer"
import { UpdateNotification } from "@/components/home/UpdateNotification"
import { useToast } from "@/hooks/use-toast"
import { SEO } from "@/components/SEO"
import { Tiles } from "@/components/ui/tiles"
import { useAuth } from "@/hooks/useAuth"

const Home = () => {
  const [firstName, setFirstName] = useState<string>("")
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, loading: authLoading, authReady } = useAuth()
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsProfileLoading(true);
        console.log("Chargement du profil utilisateur...");
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger votre profil"
          });
          return;
        }
        
        if (profile) {
          console.log("Profil chargé:", profile.first_name);
          setFirstName(profile.first_name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    // Charger le profil uniquement si l'authentification est prête et qu'un utilisateur est connecté
    if (authReady) {
      if (user) {
        loadUserProfile();
        
        // Vérification de l'envoi d'email de bienvenue
        checkWelcomeEmail();
      } else {
        // Rediriger vers login si pas d'utilisateur
        navigate('/login');
      }
    }
  }, [user, authReady, navigate, toast]);

  const checkWelcomeEmail = async () => {
    if (!user?.email || !user.email_confirmed_at) return;
    
    try {
      const { data: userProfiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', user.email);
        
      console.log({ userProfiles });
      
      if (error) {
        console.error("Erreur lors de la vérification du profil:", error);
        return;
      }
      
      if (userProfiles && !userProfiles[0]?.welcome_email_sent) {
        try {
          console.log("Envoi de l'email de bienvenue...");
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke(
            "send-welcome-emails-after-signup",
            {
              body: {
                type: "welcome",
                email: user.email,
              },
            }
          );
          
          if (emailError) {
            handleEmailError(emailError);
          } else {
            console.log("Email de bienvenue envoyé avec succès");
            
            // Mise à jour du statut dans la base de données
            await supabase
              .from('user_profiles')
              .update({ welcome_email_sent: true })
              .eq('user_email', user.email);
          }
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'email de bienvenue:", err);
    }
  };

  const handleEmailError = (emailError: any) => {
    if (emailError instanceof FunctionsHttpError) {
      console.error("Function error:", emailError.context);
    } else if (emailError instanceof FunctionsRelayError) {
      console.error("Relay error:", emailError.message);
    } else if (emailError instanceof FunctionsFetchError) {
      console.error("Fetch error:", emailError.message);
    } else {
      console.error("Unknown error:", emailError);
    }
  };

  if (authLoading || (authReady && user && isProfileLoading)) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <SEO
        title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
        description="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé."
      />
      <div className="relative min-h-screen">
        <div className="fixed inset-0 overflow-hidden">
          <Tiles
            rows={50}
            cols={8}
            tileSize="md"
            className="opacity-30"
          />
        </div>
        <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
          <WelcomeMessage firstName={firstName} />
          <ActionButtons />
          <Footer />
          <UpdateNotification />
        </div>
      </div>
    </>
  );
};

export default Home;
