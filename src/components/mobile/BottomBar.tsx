import React, { useState } from 'react';
import { User, FolderKanban } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BottomBarProps {
  firstName: string;
}

export const BottomBar = ({ firstName }: BottomBarProps) => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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

  const navigateToPage = (path: string) => {
    navigate(path);
    // Close both drawers
    setProfileDrawerOpen(false);
    setToolsDrawerOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 h-16 flex items-center md:hidden">
      <div className="w-full flex justify-around">
        {/* Outils pédagogiques Button and Drawer */}
        <Drawer open={toolsDrawerOpen} onOpenChange={setToolsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex-1 flex flex-col items-center justify-center rounded-none h-full"
            >
              <FolderKanban className="h-6 w-6 text-purple-600" />
              <span className="text-xs mt-1 text-purple-600">Outils pédagogiques</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[60vh]">
            <div className="p-4 space-y-5">
              <h3 className="font-semibold text-lg text-center mb-4">Outils pédagogiques</h3>
              
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/lesson-plan')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-purple-100">
                      ✨
                    </span>
                    Générateur de séquences
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/exercise')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-green-100">
                      🍃
                    </span>
                    Générateur d'exercices
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/correspondence')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-blue-100">
                      📝
                    </span>
                    Assistant administratif
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/image-generation')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-amber-100">
                      🖼️
                    </span>
                    Générateur d'images
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/plan-de-classe')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-green-100">
                      🪑
                    </span>
                    Plan de classe
                    <span className="ml-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5">
                      nouveau
                    </span>
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left"
                  onClick={() => navigateToPage('/saved-content')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-gray-100">
                      📚
                    </span>
                    Mes ressources
                  </span>
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Profile Button and Drawer */}
        <Drawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex-1 flex flex-col items-center justify-center rounded-none h-full"
            >
              <User className="h-6 w-6 text-gray-600" />
              <span className="text-xs mt-1 text-gray-600">Profil</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[55vh]">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-medium">{firstName || 'Utilisateur'}</p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigateToPage('/suggestions')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 text-purple-600 mr-3">💬</span>
                    Demander des fonctionnalités
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigateToPage('/settings')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 text-gray-600 mr-3">⚙️</span>
                    Paramètres
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigateToPage('/contact')}
                >
                  <span className="flex items-center">
                    <span className="w-6 h-6 text-gray-600 mr-3">❓</span>
                    Aide
                  </span>
                </Button>
              </div>
              
              <Separator className="my-3" />
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                <span className="flex items-center">
                  <span className="w-6 h-6 mr-3 flex items-center justify-center">🚪</span>
                  Déconnexion
                </span>
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default BottomBar;
