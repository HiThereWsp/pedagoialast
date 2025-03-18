
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Image, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Leaf,
  MessageCircle,
  BookOpen as BookGuide
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SidebarNavItem from './SidebarNavItem';
import SidebarNavigationSection from './SidebarNavigationSection';
import SidebarUserProfile from './SidebarUserProfile';

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
      {/* Chat IA with "Bientôt" badge */}
      <div className="mb-6 px-4 py-6">
        <SidebarNavItem 
          icon={<MessageSquare className="h-5 w-5" />} 
          label="Chat IA" 
          notAvailable={true}
          notAvailableIcon={
            <span className="ml-auto flex items-center">
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-normal px-2 py-0.5">
                Bientôt
              </Badge>
            </span>
          }
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Outils pédagogiques */}
      <SidebarNavigationSection title="Outils pédagogiques" className="mb-auto">
        <SidebarNavItem 
          icon={<Sparkles className="h-5 w-5" />} 
          label="Générateur de séquences" 
          path="/lesson-plan"
          onClick={() => navigate("/lesson-plan")}
        />
        <SidebarNavItem 
          icon={<Leaf className="h-5 w-5" />} 
          label="Générateur d'exercices" 
          path="/exercise"
          onClick={() => navigate("/exercise")}
        />
        <SidebarNavItem 
          icon={<FileText className="h-5 w-5" />} 
          label="Assistant administratif" 
          path="/correspondence"
          onClick={() => navigate("/correspondence")}
        />
        <SidebarNavItem 
          icon={<Image className="h-5 w-5" />} 
          label="Générateur d'images" 
          path="/image-generation"
          onClick={() => navigate("/image-generation")}
        />
      </SidebarNavigationSection>
      
      {/* Resources section */}
      <div className="mt-auto pt-6">
        <Separator className="mb-6" />
        
        <SidebarNavigationSection hasSeparator={true}>
          <SidebarNavItem 
            icon={<BookOpen className="h-5 w-5" />} 
            label="Mes ressources" 
            path="/saved-content"
            onClick={() => navigate("/saved-content")}
          />
          <SidebarNavItem 
            icon={<BookGuide className="h-5 w-5" />} 
            label="Guide d'utilisation" 
            path="/guide"
            onClick={() => navigate("/guide")}
          />
        </SidebarNavigationSection>
        
        {/* Feature request section */}
        <SidebarNavigationSection>
          <SidebarNavItem 
            icon={<MessageCircle className="h-5 w-5 text-purple-600" />} 
            label="Demander des fonctionnalités" 
            path="/suggestions"
            onClick={() => navigate("/suggestions")}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100"
          />
        </SidebarNavigationSection>
      </div>
      
      {/* User profile dropdown */}
      <SidebarUserProfile 
        firstName={firstName}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar;
