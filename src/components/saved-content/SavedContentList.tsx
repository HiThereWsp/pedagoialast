
import { type SavedContent } from "@/types/saved-content";
import { ResourceCard } from "./ResourceCard";

interface SavedContentListProps {
  content: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
  activeTab: string;
}

export const SavedContentList = ({ 
  content, 
  onItemSelect, 
  selectedItemId,
  activeTab
}: SavedContentListProps) => {
  // Filtrer le contenu en fonction de l'onglet actif
  const filteredContent = content.filter(item => {
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
  });

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Aucun contenu disponible pour cette catégorie
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContent.map((item) => (
        <ResourceCard
          key={item.id}
          resource={item}
          onSelect={onItemSelect}
        />
      ))}
    </div>
  );
};
