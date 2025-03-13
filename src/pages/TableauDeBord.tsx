
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { Menu, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tiles } from "@/components/ui/tiles";
import Sidebar from "@/components/dashboard/Sidebar";

const TableauDeBord = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
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
        title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
        description="Accédez à tous vos outils pédagogiques depuis votre tableau de bord personnalisé."
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile menu toggle */}
        <button
          className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          firstName={firstName}
        />
        
        {/* Main Content */}
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
            
            {/* Welcome Message */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <h1 className="text-5xl font-extrabold mb-4 text-gray-800 leading-tight tracking-tight text-balance">
                Bonjour {isLoading ? "..." : (firstName || "Enseignant")} 👋
              </h1>
              <p className="text-xl text-gray-600">Sélectionnez un outil dans le menu de gauche pour commencer</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableauDeBord;
