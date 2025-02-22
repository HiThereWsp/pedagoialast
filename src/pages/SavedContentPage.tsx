
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { SavedContentList } from "@/components/saved-content/SavedContentList";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { useSavedContentManagement } from "@/hooks/useSavedContentManagement";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

  const {
    content,
    errors,
    isLoading,
    fetchContent,
    handleDelete
  } = useSavedContentManagement();

  useEffect(() => {
    fetchContent();
  }, []);

  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === activeTab);
  };

  const handleCreate = () => {
    const currentTab = getCurrentTab();
    if (currentTab) {
      navigate(currentTab.path);
    }
  };

  if (isLoading) {
    return <SavedContentLoader />;
  }

  if (errors.exercises || errors.lessonPlans || errors.correspondences) {
    return (
      <SavedContentError 
        error={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
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
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link to="/home" className="shrink-0">
              <img 
                src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                alt="PedagoIA Logo" 
                className="w-[50px] h-[60px] object-contain" 
              />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Mes ressources
            </h1>
          </div>
          
          <Button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">{getCurrentTab()?.buttonText}</span>
            <span className="sm:hidden">Créer</span>
          </Button>
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
                className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors rounded-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <SavedContentList
          content={content}
          onItemSelect={(item) => {
            setSelectedContent(item);
            setDeleteDialog({
              isOpen: true,
              itemId: item.id,
              itemType: item.displayType || ""
            });
          }}
          selectedItemId={selectedContent?.id}
          activeTab={activeTab}
        />
      </div>

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
