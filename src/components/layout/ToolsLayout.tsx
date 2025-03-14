
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tiles } from "@/components/ui/tiles";
import Sidebar from "@/components/dashboard/Sidebar";

export const ToolsLayout = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // La sidebar est toujours visible dans ce layout
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
  
  return (
    <>
      <SEO
        title="PedagoIA - Outils pédagogiques"
        description="Accédez à tous vos outils pédagogiques avec PedagoIA, votre assistant d'enseignement IA."
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar fixe (non rétractable) */}
        <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Logo centré avec taille réduite */}
            <div className="flex justify-center items-center py-3 border-b border-gray-200">
              <a href="/home" className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                  alt="PedagoIA Logo" 
                  className="h-14 w-14" 
                />
              </a>
            </div>
            
            {/* Sidebar content */}
            <Sidebar isOpen={true} toggleSidebar={() => {}} firstName={firstName} />
          </div>
        </div>
        
        {/* Contenu principal avec marge à gauche pour la sidebar */}
        <div className="flex-1 ml-0 md:ml-64">
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
      </div>
    </>
  );
};

export default ToolsLayout;
