
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DesktopContent } from "@/components/dashboard/DesktopContent";
import { MobileContent } from "@/components/dashboard/MobileContent";
import { useMediaQuery } from "@/hooks/use-mobile";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const TableauDeBord = () => {
  const { user, loading: authLoading, authReady } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasFetchedProfile = useRef(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  useEffect(() => {
    // Fonction optimisée pour charger le profil
    const loadUserProfile = async () => {
      if (!user || hasFetchedProfile.current) return;
      
      try {
        setIsProfileLoading(true);
        
        // Vérifier le cache local d'abord
        const cachedFirstName = localStorage.getItem(`profile_firstName_${user.id}`);
        const cacheExpiry = localStorage.getItem(`profile_expiry_${user.id}`);
        
        if (cachedFirstName && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
          setFirstName(cachedFirstName);
          setIsProfileLoading(false);
          hasFetchedProfile.current = true;
          return;
        }
        
        // Sinon, charger depuis Supabase
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
          
          // Mettre en cache pour 30 minutes
          localStorage.setItem(`profile_firstName_${user.id}`, profile.first_name);
          localStorage.setItem(`profile_expiry_${user.id}`, (Date.now() + 30 * 60 * 1000).toString());
          
          hasFetchedProfile.current = true;
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    if (authReady && !authLoading && user && !hasFetchedProfile.current) {
      loadUserProfile();
    }
  }, [user, authReady, authLoading]);
  
  // Journalisation spécifique pour l'utilisateur problématique
  useEffect(() => {
    if (user?.email === 'andyguitteaud@gmail.co') {
      console.log('[DEBUG] État utilisateur problématique:', { 
        userId: user.id,
        email: user.email,
        authReady,
        firstName,
        isProfileLoading,
        currentPath: window.location.pathname
      });
    }
  }, [user, authReady, firstName, isProfileLoading]);

  // Si l'authentification est encore en cours, afficher un indicateur de chargement
  if (authLoading || !authReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator 
          message="Vérification de l'authentification..." 
          submessage="Veuillez patienter"
          type="spinner"
          size="lg"
        />
      </div>
    );
  }
  
  return (
    <DashboardWrapper>
      <Helmet>
        <title>Tableau de bord | PedagoIA</title>
        <meta name="description" content="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé." />
      </Helmet>
      
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        firstName={firstName} 
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'}`}>
        {/* Mobile Header Menu Button */}
        {isMobile && (
          <div className="fixed top-0 left-0 z-30 p-4">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-md bg-white shadow-md"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content based on device */}
        {isMobile ? (
          <MobileContent firstName={firstName} isLoading={isProfileLoading} />
        ) : (
          <DesktopContent firstName={firstName} isLoading={isProfileLoading} />
        )}
      </div>
    </DashboardWrapper>
  );
};

export default TableauDeBord;
