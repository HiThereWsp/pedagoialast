
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { SavedContentList } from "@/components/saved-content/SavedContentList";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { ContentPreviewSheet } from "@/components/saved-content/ContentPreviewSheet";
import { useSavedContentManagement } from "@/hooks/useSavedContentManagement";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/settings/BackButton";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
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

  const navigate = useNavigate();
  const { authReady } = useAuth();

  const {
    content,
    errors,
    isLoading,
    isRefreshing,
    fetchContent,
    handleDelete
  } = useSavedContentManagement();

  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === activeTab);
  };

  const handleCreate = () => {
    const currentTab = getCurrentTab();
    if (currentTab) {
      navigate(currentTab.path);
    }
  };

  const handleDeleteRequest = (content: SavedContent) => {
    setIsPreviewOpen(false);
    setDeleteDialog({
      isOpen: true,
      itemId: content.id,
      itemType: content.displayType || ""
    });
  };

  const handleRefresh = () => {
    fetchContent();
  };

  if (isLoading && !isRefreshing) {
    return <SavedContentLoader />;
  }

  if (errors.exercises || errors.lessonPlans || errors.correspondences) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        
        <SavedContentError 
          error={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
        />
        
        <div className="mt-6 flex justify-center">
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
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
        <div className="mb-4">
          <BackButton />
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Mes ressources
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
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

        <Tabs 
          defaultValue="sequences" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-[#FFA800] data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] transition-colors rounded-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isRefreshing ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-10 w-10 animate-spin text-[#FFA800] mb-4" />
              <p className="text-gray-500">Actualisation des données...</p>
            </div>
          </div>
        ) : (
          <SavedContentList
            content={content}
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
        onDelete={() => handleDelete(deleteDialog.itemId, content.find(item => item.id === deleteDialog.itemId)?.type || 'lesson-plan')}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
}
