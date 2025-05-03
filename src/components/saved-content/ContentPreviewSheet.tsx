import React, { useState, useCallback, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { ScrollCard } from "@/components/exercise/result/ScrollCard";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SavedContent } from "@/types/saved-content";

interface ContentPreviewSheetProps {
  content: SavedContent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (content: SavedContent) => void;
}

export const ContentPreviewSheet = React.memo(({
  content,
  isOpen,
  onOpenChange,
  onDelete
}: ContentPreviewSheetProps) => {
  // Always declare hooks at the top level, before any conditionals
  const [activeTab, setActiveTab] = useState('student');
  const { toast } = useToast();

  // Fonction pour formater les dates
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return "Date invalide";
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content.content);
      toast({
        description: "Contenu copié dans le presse-papier",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du contenu",
      });
    }
  }, [content, toast]);

  const handleDelete = useCallback(() => {
    if (content) {
      onDelete(content);
    }
  }, [content, onDelete]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const renderContent = useCallback(() => {
    if (!content) return null;
    
    switch (content.type) {
      case 'music-lesson':
        return (
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Chanson</h3>
            {content.lyrics ? (
              <pre className="whitespace-pre-wrap font-sans text-base bg-gray-50 p-4 rounded-md border border-gray-200">
                {content.lyrics}
              </pre>
            ) : (
              <div className="text-gray-500">
                <p>Contenu des paroles non disponible</p>
              </div>
            )}
            <div className="mt-6 text-sm text-gray-500">
              <p>Créé le {formatDate(content.created_at)}</p>
              {content.subject && <p>Matière: {content.subject}</p>}
              {content.class_level && <p>Niveau: {content.class_level}</p>}
            </div>
          </div>
        );
      case 'exercise':
        return (
          <>
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="mt-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Fiche Élève</TabsTrigger>
                <TabsTrigger value="correction">Correction</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-6">
              <ScrollCard 
                exercises={content.content} 
                showCorrection={activeTab === 'correction'}
                customClass="text-sm"
                hideActions={true}
                disableInternalTabs={true}
              />
            </div>
          </>
        );
      case 'Image':
        return (
          <div className="mt-6">
            <img 
              src={content.content} 
              alt={content.title} 
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
          </div>
        );
      case 'lesson-plan':
      case 'correspondence':
      default:
        return (
          <div className="mt-6">
            <ScrollCard 
              exercises={content.content} 
              showCorrection={false}
              customClass="text-sm"
              hideActions={true}
            />
          </div>
        );
    }
  }, [content, activeTab, handleTabChange, formatDate]);

  // Now we can have our conditional rendering after all hooks are defined
  if (!content || !isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold">
            {content.title || 'Sans titre'}
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {renderContent()}
      </SheetContent>
    </Sheet>
  );
});

ContentPreviewSheet.displayName = "ContentPreviewSheet";
