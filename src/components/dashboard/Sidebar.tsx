
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LogOut,
  MessageCircle
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SidebarButton from './SidebarButton';
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  firstName: string;
}

export const Sidebar = ({ isOpen, toggleSidebar, firstName }: SidebarProps) => {
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
        {/* Logo centré et agrandi */}
        <div className="flex justify-center items-center py-5 border-b border-gray-200">
          <Link to="/home" className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-20 w-20" 
            />
            <span className="text-xl font-bold mt-2">PedagoIA</span>
          </Link>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col">
          {/* Accueil & Assistant */}
          <div className="space-y-2">
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
          
          <Separator className="my-2" />
          
          {/* Outils pédagogiques */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Outils pédagogiques</h3>
            <div className="space-y-2">
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
          
          <Separator className="my-2" />
          
          {/* Suggestions et ressources */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Vos outils</h3>
            <div className="space-y-2">
              <SidebarButton 
                icon={<MessageCircle className="h-5 w-5" />} 
                label="Demander des fonctionnalités" 
                onClick={() => navigate("/suggestions")}
              />
              <SidebarButton 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Mes ressources" 
                onClick={() => navigate("/saved-content")}
              />
            </div>
          </div>
          
          <div className="mt-auto">
            <Separator className="my-4" />
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

export default Sidebar;
