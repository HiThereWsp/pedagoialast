
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileContent } from '@/components/dashboard/MobileContent';
import { DesktopContent } from '@/components/dashboard/DesktopContent';
import { SidebarToggle } from '@/components/dashboard/SidebarToggle';
import { WelcomeEmailHandler } from '@/components/dashboard/WelcomeEmailHandler';

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
  }, [user]);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <>
      <SEO
        title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
        description="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé."
      />
      
      {/* Handle welcome email sending */}
      {user && (
        <WelcomeEmailHandler 
          userEmail={user.email} 
          emailConfirmedAt={user.email_confirmed_at} 
        />
      )}
      
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop sidebar toggle */}
        {!isMobile && (
          <SidebarToggle 
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}
        
        {/* Desktop sidebar */}
        {!isMobile && (
          <DashboardSidebar 
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            firstName={firstName}
          />
        )}
        
        {/* Main Content with adjustments for mobile */}
        <div className={`flex-1 ${!isMobile ? 'ml-0 md:ml-64' : 'mt-16 mb-16'}`}>
          <DashboardWrapper>
            {isMobile ? (
              <MobileContent firstName={firstName} isLoading={isLoading} />
            ) : (
              <DesktopContent firstName={firstName} />
            )}
          </DashboardWrapper>
        </div>
      </div>
    </>
  );
};

export default TableauDeBord;
