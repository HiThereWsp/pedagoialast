
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { Menu, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tiles } from "@/components/ui/tiles";
import Sidebar from "@/components/dashboard/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomBar } from '@/components/mobile/BottomBar';
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ActionButtons } from "@/components/home/ActionButtons";
import { UpdateNotification } from "@/components/home/UpdateNotification";
import { UserMenu } from "@/components/home/UserMenu";
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";

const TableauDeBord = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Erreur lors de la récupération du profil:", error);
        } else if (profile) {
          setFirstName(profile.first_name || "");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
    
    // Vérification de l'envoi d'email de bienvenue
    if (user) {
      checkWelcomeEmail();
    }
  }, [user]);
  
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
  
  return (
    <>
      <SEO
        title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
        description="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé."
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile menu toggle - only visible if NOT on mobile */}
        {!isMobile && (
          <button
            className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
        
        {/* Sidebar - only for desktop */}
        {!isMobile && (
          <div className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg`}>
            <div className="flex flex-col h-full">
              {/* Logo centré avec taille réduite */}
              <div className="flex justify-center items-center py-3 border-b border-gray-200">
                <a href="/tableaudebord" className="flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                    alt="PedagoIA Logo" 
                    className="h-14 w-14" 
                  />
                </a>
              </div>
              
              {/* Sidebar content rendered using the Sidebar component */}
              <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} firstName={firstName} />
            </div>
          </div>
        )}
        
        {/* Main Content with adjustments for mobile (padding at top for mobile header) */}
        <div className={`flex-1 ${!isMobile ? 'ml-0 md:ml-64' : 'mt-16 mb-16'}`}>
          {/* Mobile header - only visible on mobile */}
          {isMobile && (
            <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4">
              <div className="flex-1 flex justify-center">
                <a href="/tableaudebord" className="flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                    alt="PedagoIA Logo" 
                    className="h-12 w-12" 
                  />
                </a>
              </div>
            </div>
          )}
          
          <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 overflow-hidden">
              <Tiles
                rows={50}
                cols={8}
                tileSize="md"
                className="opacity-30"
              />
            </div>
            
            {/* Pour les appareils mobiles, nous utilisons la disposition du tableau de bord existant */}
            {isMobile ? (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full px-6">
                <h1 className="text-4xl font-extrabold mb-4 text-gray-800 leading-tight tracking-tight text-balance">
                  Bonjour {isLoading ? "..." : (firstName || "Enseignant")} 👋
                </h1>
                <p className="text-xl text-gray-600 mb-8">Sélectionnez un outil pour commencer</p>
                
                {/* Action buttons will be shown in bottom bar on mobile */}
              </div>
            ) : (
              /* Pour desktop, nous intégrons les composants de la page Home avec le style de TableauDeBord */
              <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
                <UserMenu />
                <WelcomeMessage firstName={firstName} />
                <ActionButtons />
                <UpdateNotification />
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Bar for Mobile */}
        {isMobile && <BottomBar firstName={firstName} />}
      </div>
    </>
  );
};

export default TableauDeBord;
