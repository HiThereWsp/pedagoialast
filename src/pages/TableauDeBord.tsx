
import React, { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  Image, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Leaf, 
  Settings,
  HelpCircle,
  Menu,
  X,
  Clock,
  LogOut
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tiles } from "@/components/ui/tiles";
import { useToast } from "@/hooks/use-toast";

// Composant pour les boutons de la sidebar
const SidebarButton = ({ 
  icon, 
  label, 
  active = false, 
  small = false, 
  notAvailable = false, 
  notAvailableIcon,
  onClick
}) => {
  return (
    <button 
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${small ? 'text-xs' : ''} ${notAvailable ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={notAvailable}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {notAvailable && (
        <span className="ml-auto flex items-center text-xs font-medium">
          {notAvailableIcon || <Clock className="h-3.5 w-3.5 text-amber-500" />}
          <span className="ml-1 text-amber-500">Bientôt</span>
        </span>
      )}
    </button>
  );
};

// Composant pour la sidebar
const Sidebar = ({ isOpen, toggleSidebar, firstName }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        toast({
          variant: "destructive",
          title: "Erreur de déconnexion",
          description: "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
        });
      } else {
        localStorage.clear();
        navigate('/bienvenue');
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      localStorage.clear();
      navigate('/bienvenue');
    }
  };

  return (
    <div className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Link to="/home" className="flex items-center gap-2">
              <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">PedagoIA</span>
            </Link>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
          {/* Main Navigation */}
          <div className="space-y-1">
            <SidebarButton 
              icon={<Home className="h-5 w-5" />} 
              label="Accueil" 
              onClick={() => navigate("/home")}
            />
            <SidebarButton 
              icon={<MessageSquare className="h-5 w-5" />} 
              label="Assistant IA avancé" 
              notAvailable={true}
            />
          </div>
          
          {/* Outils pédagogiques */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Outils pédagogiques</h3>
            <div className="space-y-1">
              <SidebarButton 
                icon={<Sparkles className="h-5 w-5" />} 
                label="Générateur de séquences" 
                onClick={() => navigate("/lesson-plan")}
              />
              <SidebarButton 
                icon={<Leaf className="h-5 w-5" />} 
                label="Générateur d'exercices" 
                onClick={() => navigate("/exercise")}
              />
              <SidebarButton 
                icon={<FileText className="h-5 w-5" />} 
                label="Assistant administratif" 
                onClick={() => navigate("/correspondence")}
              />
              <SidebarButton 
                icon={<Image className="h-5 w-5" />} 
                label="Générateur d'images" 
                onClick={() => navigate("/image-generation")}
              />
            </div>
          </div>
          
          {/* Mes ressources - placé en bas */}
          <div className="space-y-2 mt-auto">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Ressources</h3>
            <div className="space-y-1">
              <SidebarButton 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Mes ressources" 
                onClick={() => navigate("/saved-content")}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{firstName || 'Utilisateur'}</p>
                <p className="text-xs text-gray-500">Enseignant</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <SidebarButton 
                icon={<Settings className="h-4 w-4" />} 
                label="Paramètres" 
                small 
                onClick={() => navigate("/settings")}
              />
              <SidebarButton 
                icon={<HelpCircle className="h-4 w-4" />} 
                label="Aide" 
                small 
                onClick={() => navigate("/contact")}
              />
              <SidebarButton 
                icon={<LogOut className="h-4 w-4" />} 
                label="Déconnexion" 
                small 
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
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
