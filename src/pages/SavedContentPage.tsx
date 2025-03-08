import { useEffect, useState, useCallback, useRef } from "react";
import { SEO } from "@/components/SEO";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { SavedContentList } from "@/components/saved-content/SavedContentList";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { ContentPreviewSheet } from "@/components/saved-content/ContentPreviewSheet";
import { useSavedContentManagement } from "@/hooks/saved-content/useSavedContentManagement";
import { useStableContent } from "@/hooks/saved-content/useStableContent";
import { SavedContentHeader } from "@/components/saved-content/SavedContentHeader";
import { SavedContentTabs } from "@/components/saved-content/SavedContentTabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/settings/BackButton";
import { RefreshCw } from "lucide-react";

export default function SavedContentPage() {
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sequences');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: ""
  });
  
  const didInitialFetch = useRef(false);
  const navigate = useNavigate();
  const { authReady, user } = useAuth();

  // Utilisation du hook de stabilisation
  const { stableContent, updateContent } = useStableContent();

  const {
    content,
    errors,
    isLoading,
    isRefreshing,
    fetchContent,
    handleDelete,
    cleanup
  } = useSavedContentManagement();

  // Mettre à jour le contenu stable lorsque le contenu change
  useEffect(() => {
    if (content && content.length > 0) {
      updateContent(content);
    }
  }, [content, updateContent]);

  // Charger les données une seule fois après l'authentification
  useEffect(() => {
    if (authReady && user && !didInitialFetch.current) {
      console.log("Chargement initial des données...");
      didInitialFetch.current = true;
      fetchContent().catch(err => {
        console.error("Erreur lors du chargement initial:", err);
      });
    }
  }, [authReady, user, fetchContent]);

  // Version asynchrone de handleRefresh - corrige l'erreur TypeScript
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        const refreshedContent = await fetchContent();
        console.log(`Rafraîchissement terminé: ${refreshedContent.length} éléments chargés`);
      } catch (error) {
        console.error("Erreur lors du rafraîchissement:", error);
      }
    }
    return Promise.resolve();
  }, [fetchContent, isRefreshing]);

  const handleDeleteRequest = useCallback((content: SavedContent) => {
    setIsPreviewOpen(false);
    setDeleteDialog({
      isOpen: true,
      itemId: content.id,
      itemType: content.displayType || ""
    });
  }, []);

  // Nettoyer les ressources uniquement lors du démontage
  useEffect(() => {
    return () => {
      console.log("Nettoyage lors du démontage de SavedContentPage");
      cleanup?.();
    };
  }, [cleanup]);

  // Afficher le chargement seulement lors du chargement initial
  if (isLoading && !isRefreshing && stableContent.length === 0) {
    return <SavedContentLoader activeTab={activeTab} />;
  }

  if (errors.exercises || errors.lessonPlans || errors.correspondences) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        
        <SavedContentError 
          error={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
          onRetry={handleRefresh}
        />
      </div>
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
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <SavedContentTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {isRefreshing ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-10 w-10 animate-spin text-[#FFA800] mb-4" />
              <p className="text-gray-500">Actualisation des données...</p>
            </div>
          </div>
        ) : (
          <SavedContentList
            content={stableContent}
            onItemSelect={(item) => {
              setSelectedContent(item);
              setIsPreviewOpen(true);
            }}
            selectedItemId={selectedContent?.id}
            activeTab={activeTab}
          />
        )}
      </div>

      <ContentPreviewSheet
        content={selectedContent}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onDelete={handleDeleteRequest}
      />

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
        onDelete={() => {
          const item = stableContent.find(item => item.id === deleteDialog.itemId);
          if (item) {
            handleDelete(deleteDialog.itemId, item.type);
            setDeleteDialog(prev => ({ ...prev, isOpen: false }));
          }
        }}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
}
