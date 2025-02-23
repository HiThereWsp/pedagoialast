
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
  const filteredContent = content.filter(item => {
    if (!item) return false; // Protection supplémentaire contre les éléments null
    
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
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">
          Aucun contenu disponible pour cette catégorie
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
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
