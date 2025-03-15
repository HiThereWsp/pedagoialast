
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Image, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Leaf,
  Settings,
  HelpCircle,
  LogOut,
  MessageCircle,
  Mail
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SidebarButton from './SidebarButton';
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  firstName: string;
}

export const Sidebar = ({ isOpen, toggleSidebar, firstName }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Vérifier d'abord si une session existe
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Erreur lors de la session:", sessionError);
        localStorage.clear();
        navigate('/bienvenue');
        return;
      }

      if (!session) {
        console.log("Aucune session trouvée, redirection vers bienvenue");
        navigate('/bienvenue');
        return;
      }

      // Si on a une session valide, on tente la déconnexion
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
    <div className="flex flex-col h-full">
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col">
        {/* Assistant section - "Accueil" removed */}
        <div className="space-y-2">
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
              path="/lesson-plan"
              onClick={() => navigate("/lesson-plan")}
            />
            <SidebarButton 
              icon={<Leaf className="h-5 w-5" />} 
              label="Générateur d'exercices" 
              path="/exercise"
              onClick={() => navigate("/exercise")}
            />
            <SidebarButton 
              icon={<FileText className="h-5 w-5" />} 
              label="Assistant administratif" 
              path="/correspondence"
              onClick={() => navigate("/correspondence")}
            />
            <SidebarButton 
              icon={<Image className="h-5 w-5" />} 
              label="Générateur d'images" 
              path="/image-generation"
              onClick={() => navigate("/image-generation")}
            />
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {/* Suppression du titre "Vos outils" */}
        <div className="space-y-2">
          <div className="space-y-2">
            {/* Mise en évidence de "Demander des fonctionnalités" */}
            <SidebarButton 
              icon={<MessageCircle className="h-5 w-5 text-purple-600" />} 
              label="Demander des fonctionnalités" 
              path="/suggestions"
              onClick={() => navigate("/suggestions")}
              className="bg-purple-50 text-purple-700 hover:bg-purple-100"
            />
            <SidebarButton 
              icon={<BookOpen className="h-5 w-5" />} 
              label="Mes ressources" 
              path="/saved-content"
              onClick={() => navigate("/saved-content")}
            />
          </div>
        </div>
        
        <div className="mt-auto">
          <Separator className="my-4" />
        </div>
      </div>
      
      {/* Footer with Dropdown Menu */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors w-full">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{firstName || 'Utilisateur'}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                <span>Nous contacter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
