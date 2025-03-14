
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
import { Footer } from "@/components/home/Footer";
import { UpdateNotification } from "@/components/home/UpdateNotification";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";

const TableauDeBord = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading: authLoading, authReady } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }
  
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
        
        {/* Main Content */}
        {isMobile ? (
          <div className="relative z-10 min-h-screen w-full flex flex-col items-center px-6 py-8 max-w-md mx-auto mt-16 mb-16">
            {/* Mobile header - only visible on mobile */}
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
            
            <div className="fixed inset-0 overflow-hidden">
              <Tiles
                rows={50}
                cols={8}
                tileSize="md"
                className="opacity-30"
              />
            </div>
            
            <WelcomeMessage firstName={firstName} />
            <ActionButtons />
            <Footer />
            <UpdateNotification />
            
            {/* Bottom Bar for Mobile */}
            <BottomBar firstName={firstName} />
          </div>
        ) : (
          <div className={`flex-1 ${!isMobile ? 'ml-0 md:ml-64' : ''}`}>
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
              
              {/* Welcome Message */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <h1 className="text-5xl font-extrabold mb-4 text-gray-800 leading-tight tracking-tight text-balance">
                  Bonjour {isProfileLoading ? "..." : (firstName || "Enseignant")} 👋
                </h1>
                <p className="text-xl text-gray-600">Sélectionnez un outil pour commencer</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TableauDeBord;
