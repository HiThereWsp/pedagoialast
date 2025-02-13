
import React, { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import ContentCategory from "@/components/saved-content/ContentCategory";
import DeleteDialog from "@/components/saved-content/DeleteDialog";
import { useContentManagement } from "@/hooks/saved-content/useContentManagement";

const SavedContentPage: React.FC = () => {
  const {
    content,
    selectedContent,
    setSelectedContent,
    errors,
    isLoading,
    fetchContent,
    handleDelete
  } = useContentManagement();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: ""
  });

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const colorMap = {
    'Séquence': {
      color: '#FF9EBC',
      backgroundColor: '#FF9EBC20',
      borderColor: '#FF9EBC4D'
    },
    'Exercice': {
      color: '#22C55E',
      backgroundColor: '#22C55E20',
      borderColor: '#22C55E4D'
    },
    'Image': {
      color: '#F2FCE2',
      backgroundColor: '#F2FCE220',
      borderColor: '#F2FCE24D'
    }
  };

  const carouselCategories = [
    {
      title: "Mes séquences pédagogiques",
      type: "Séquence",
      emptyMessage: "Vous n'avez pas encore généré de séquence pédagogique. C'est le moment de laisser libre cours à votre créativité !"
    },
    {
      title: "Mes exercices",
      type: "Exercice",
      emptyMessage: "Aucun exercice n'a encore été créé. Commencez à générer des exercices adaptés à vos besoins !"
    },
    {
      title: "Mes images",
      type: "Image",
      emptyMessage: "Votre galerie d'images est vide pour le moment. Générez votre première illustration pédagogique !"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errors.exercises || errors.lessonPlans) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{errors.exercises || errors.lessonPlans}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Mes ressources pédagogiques générées</h1>
        </div>

        <div className="space-y-8">
          {carouselCategories.map(category => (
            <ContentCategory
              key={category.type}
              {...category}
              items={content}
              onItemSelect={(item) => {
                setSelectedContent(item);
                setDeleteDialog({
                  isOpen: true,
                  itemId: item.id,
                  itemType: item.type
                });
              }}
              selectedItemId={selectedContent?.id}
              colorMap={colorMap}
            />
          ))}
        </div>
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => 
          setDeleteDialog(prev => ({ ...prev, isOpen }))
        }
        onConfirm={() => handleDelete(deleteDialog.itemId, deleteDialog.itemType)}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
};

export default SavedContentPage;
