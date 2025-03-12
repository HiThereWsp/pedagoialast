
import React from "react";
import { SEO } from "@/components/SEO";
import { SavedContentLoader } from "./SavedContentLoader";
import { SavedContentError } from "./SavedContentError";
import { SavedContentHeader } from "./SavedContentHeader";
import { SavedContentTabs } from "./SavedContentTabs";

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
  onRefresh,
  onTabChange,
  children
}) => {
  // Simplifier la logique d'affichage en unifiant les états de chargement
  const isInitialLoading = isLoading && contentCount === 0;
  const showLoader = isInitialLoading || (isRefreshing && contentCount === 0);
  const loadingMessage = "Chargement en cours...";

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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SavedContentHeader 
          activeTab={activeTab}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        
        <SavedContentTabs 
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {showLoader ? (
          <SavedContentLoader message={loadingMessage} />
        ) : contentCount === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-balance font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              Aucun contenu disponible
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              Créez votre premier contenu dès maintenant !
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
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
