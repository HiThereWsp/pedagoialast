
import React, { useMemo, useCallback } from "react";
import { type SavedContent } from "@/types/saved-content";
import { ResourceCard } from "./ResourceCard";

interface SavedContentListProps {
  content: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
  activeTab: string;
  isMobileView?: boolean;
  sectionMode?: boolean;
}

export const SavedContentList = React.memo(({ 
  content, 
  onItemSelect, 
  selectedItemId,
  activeTab,
  isMobileView = false,
  sectionMode = false
}: SavedContentListProps) => {
  
  console.log(`🔍 SavedContentList: Contenu reçu: ${content.length} éléments, onglet actif: ${activeTab}, mode section: ${sectionMode}`);
  
  // Vérifier la structure des données reçues pour le débogage
  if (content.length > 0) {
    console.log("📋 Exemple d'élément:", { 
      id: content[0].id,
      title: content[0].title,
      type: content[0].type,
      displayType: content[0].displayType,
      tags: content[0].tags
    });
  }
  
  const filteredContent = useMemo(() => content.filter(item => {
    if (!item) return false; // Protection supplémentaire contre les éléments null
    
    // Journaliser les types d'éléments pour débogage
    console.log(`🔍 Item type check: ${item.id} - type=${item.type}`);
    
    switch (activeTab) {
      case 'sequences':
        return item.type === 'lesson-plan';
      case 'exercises':
        return item.type === 'exercise';
      case 'images':
        return item.type === 'Image';
      case 'correspondence':
        return item.type === 'correspondence';
      default:
        return true;
    }
  }), [content, activeTab]);

  console.log(`📊 SavedContentList: Contenu filtré pour l'onglet ${activeTab}: ${filteredContent.length} éléments`);

  const handleItemSelect = useCallback((item: SavedContent) => {
    onItemSelect(item);
  }, [onItemSelect]);

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Aucun contenu disponible pour cette catégorie
        </p>
      </div>
    );
  }

  // Mobile view with sections uses full width cards
  return (
    <div className={`grid ${isMobileView || sectionMode ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-6`}>
      {filteredContent.map((item) => (
        <ResourceCard
          key={item.id}
          resource={item}
          onSelect={handleItemSelect}
          isSelected={item.id === selectedItemId}
        />
      ))}
    </div>
  );
});

SavedContentList.displayName = "SavedContentList";
