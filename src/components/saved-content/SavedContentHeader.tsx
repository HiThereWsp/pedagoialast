
import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/settings/BackButton";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';

// Définition des onglets pour réutilisation
export const savedContentTabs = [
  {
    id: 'sequences',
    label: 'Mes séquences',
    buttonText: 'Créer une nouvelle séquence',
    path: '/lesson-plan'
  },
  {
    id: 'exercises',
    label: 'Mes exercices',
    buttonText: 'Générer un nouvel exercice',
    path: '/exercise'
  },
  {
    id: 'images',
    label: 'Mes images',
    buttonText: 'Générer une nouvelle image',
    path: '/image-generation'
  },
  {
    id: 'correspondence',
    label: 'Mes correspondances',
    buttonText: 'Générer une correspondance',
    path: '/correspondence'
  }
] as const;

interface SavedContentHeaderProps {
  activeTab: string;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const SavedContentHeader: React.FC<SavedContentHeaderProps> = React.memo(({ 
  activeTab, 
  onRefresh,
  isRefreshing 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const currentTab = useMemo(() => {
    return savedContentTabs.find(tab => tab.id === activeTab) || savedContentTabs[0];
  }, [activeTab]);

  const handleCreate = useCallback(() => {
    navigate(currentTab.path);
  }, [navigate, currentTab]);

  const handleRefresh = useCallback(async () => {
    if (!isRefreshing) {
      await onRefresh();
    }
  }, [onRefresh, isRefreshing]);

  return (
    <>
      <div className={`${isMobile ? 'mb-2' : 'mb-3 md:mb-4'}`}>
        <BackButton />
      </div>
      
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold leading-tight tracking-tight text-balance`}>
          Mes <span className="bg-black text-white px-2 py-1 rounded rotate-1 inline-block">ressources</span>
        </h1>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            className="rounded-full"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#FFDD00] via-[#FFA800] to-[#FF7A00] hover:opacity-90 text-white shadow-sm"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="w-3.5 h-3.5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{currentTab.buttonText}</span>
            <span className="sm:hidden">Créer</span>
          </Button>
        </div>
      </div>
    </>
  );
});

SavedContentHeader.displayName = "SavedContentHeader";
