
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BetaWelcomeNotification } from "@/components/beta/BetaWelcomeNotification";
import { useAuth } from "@/hooks/useAuth";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DesktopContent } from "@/components/dashboard/DesktopContent";
import { MobileContent } from "@/components/dashboard/MobileContent";
import { useMediaQuery } from "@/hooks/use-mobile";

const TableauDeBord = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
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
      
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        firstName={firstName} 
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
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
          <DesktopContent firstName={firstName} />
        )}
      </div>
    </DashboardWrapper>
  );
};

export default TableauDeBord;
