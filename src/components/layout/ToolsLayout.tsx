
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tiles } from "@/components/ui/tiles";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomBar } from '@/components/mobile/BottomBar';

export const ToolsLayout = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // La sidebar est toujours visible sur desktop
  const sidebarOpen = true;
  
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
  }, [user]);

  // Fonction pour revenir à la page précédente en utilisant React Router
  const handleGoBack = () => {
    console.log("Going back from location:", location.pathname);
    navigate(-1);
  };
  
  // Safe navigation using React Router
  const safeNavigate = (path: string) => {
    console.log(`Safe navigation to: ${path} from: ${location.pathname}`);
    navigate(path);
  };
  
  return (
    <>
      <SEO
        title="PedagoIA - Outils pédagogiques"
        description="Accédez à tous vos outils pédagogiques avec PedagoIA, votre assistant d'enseignement IA."
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar fixe sur desktop uniquement */}
        {!isMobile && (
          <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg">
            <div className="flex flex-col h-full">
              {/* Logo centré avec taille réduite */}
              <div className="flex justify-center items-center py-4 border-b border-gray-200">
                <div onClick={() => safeNavigate('/tableaudebord')} className="flex items-center justify-center cursor-pointer">
                  <img 
                    src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                    alt="PedagoIA Logo" 
                    className="h-16 w-16" 
                  />
                </div>
              </div>
              
              {/* Sidebar content */}
              <Sidebar isOpen={true} toggleSidebar={() => {}} firstName={firstName} />
            </div>
          </div>
        )}
        
        {/* Barre de navigation mobile */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-3"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 flex justify-center">
              <div onClick={() => safeNavigate('/tableaudebord')} className="flex items-center justify-center cursor-pointer">
                <img 
                  src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                  alt="PedagoIA Logo" 
                  className="h-12 w-12" 
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Contenu principal avec marge à gauche pour la sidebar sur desktop */}
        <div className={`flex-1 ${!isMobile ? 'ml-0' : 'mt-16 mb-16'}`}>
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
            
            {/* Contenu de la page */}
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </div>
        
        {/* Bottom Bar for Mobile */}
        {isMobile && <BottomBar firstName={firstName} />}
      </div>
    </>
  );
};

export default ToolsLayout;
