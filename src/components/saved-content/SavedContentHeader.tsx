
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/settings/BackButton";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export const SavedContentHeader: React.FC<SavedContentHeaderProps> = ({ 
  activeTab, 
  onRefresh,
  isRefreshing 
}) => {
  const navigate = useNavigate();

  const getCurrentTab = useCallback(() => {
    return savedContentTabs.find(tab => tab.id === activeTab);
  }, [activeTab]);

  const handleCreate = useCallback(() => {
    const currentTab = getCurrentTab();
    if (currentTab) {
      navigate(currentTab.path);
    }
  }, [getCurrentTab, navigate]);

  return (
    <>
      <div className="mb-4">
        <BackButton />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight text-balance">
          Mes ressources
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#FFDD00] via-[#FFA800] to-[#FF7A00] hover:opacity-90 text-white shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">{getCurrentTab()?.buttonText}</span>
            <span className="sm:hidden">Créer</span>
          </Button>
        </div>
      </div>
    </>
  );
};
