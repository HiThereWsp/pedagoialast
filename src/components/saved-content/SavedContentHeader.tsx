
import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/settings/BackButton";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';

// Définition des onglets pour réutilisation
export const savedContentTabs = [{
  id: 'sequences',
  label: 'Mes séquences',
  buttonText: 'Créer une nouvelle séquence',
  path: '/lesson-plan',
  color: 'from-[#FFE29F] to-[#FF719A]'
}, {
  id: 'exercises',
  label: 'Mes exercices',
  buttonText: 'Générer un nouvel exercice',
  path: '/exercise',
  color: 'from-[#F97316] to-[#FF8E7C]'
}, {
  id: 'images',
  label: 'Mes images',
  buttonText: 'Générer une nouvelle image',
  path: '/image-generation',
  color: 'from-[#0EA5E9] to-[#38BDF8]'
}, {
  id: 'correspondence',
  label: 'Mes correspondances',
  buttonText: 'Générer une correspondance',
  path: '/correspondence',
  color: 'from-[#9b87f5] to-[#6E59A5]'
}] as const;

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
  
  return <>
      <div className="mb-3 md:mb-4">
        <BackButton fallbackPath="/tableaudebord" />
      </div>
      
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button onClick={handleRefresh} variant="outline" size={isMobile ? "sm" : "icon"} className="rounded-full" disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleCreate} 
            className={`bg-gradient-to-r ${currentTab.color} hover:opacity-90 text-white shadow-sm text-xs md:text-sm`} 
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{currentTab.buttonText}</span>
            <span className="sm:hidden">Créer</span>
          </Button>
        </div>
      </div>
    </>;
});

SavedContentHeader.displayName = "SavedContentHeader";
