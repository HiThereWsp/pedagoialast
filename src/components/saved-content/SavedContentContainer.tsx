
import React from "react";
import { SEO } from "@/components/SEO";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { RefreshIndicator } from "@/components/saved-content/RefreshIndicator";
import { SavedContentHeader } from "@/components/saved-content/SavedContentHeader";
import { SavedContentTabs } from "@/components/saved-content/SavedContentTabs";
import { useIsMobile } from '@/hooks/use-mobile';

interface SavedContentContainerProps {
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage: string;
  activeTab: string;
  contentCount: number;
  waitTime: number;
  children: React.ReactNode;
  
  onRefresh: () => Promise<void>;
  onTabChange: (tab: string) => void;
}

export const SavedContentContainer: React.FC<SavedContentContainerProps> = ({
  isLoading,
  isRefreshing,
  hasError,
  errorMessage,
  activeTab,
  contentCount,
  waitTime,
  onRefresh,
  onTabChange,
  children
}) => {
  const isMobile = useIsMobile();
  
  console.log("📊 SavedContentContainer: État du conteneur:", { 
    isLoading, 
    isRefreshing, 
    hasError, 
    contentCount,
    activeTab
  });

  if (isLoading && !isRefreshing && contentCount === 0) {
    return <SavedContentLoader activeTab={activeTab} />;
  }

  if (hasError) {
    return (
      <SavedContentError 
        error={errorMessage}
        onRetry={onRefresh}
      />
    );
  }

  return (
    <>
      <SEO 
        title="Mes ressources | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
        <SavedContentHeader 
          activeTab={activeTab}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        
        <SavedContentTabs 
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {isRefreshing ? (
          <RefreshIndicator waitTime={waitTime} />
        ) : contentCount === 0 ? (
          <div className="text-center py-10 md:py-16">
            <p className="text-xl text-balance font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              Aucun contenu disponible
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg mb-4 md:mb-6">
              Créez votre premier contenu dès maintenant !
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">
              Utilisez les outils de création pour générer des exercices, séquences ou documents.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
};
