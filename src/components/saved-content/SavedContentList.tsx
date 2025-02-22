
import { type SavedContent } from "@/types/saved-content";
import { Card } from "@/components/ui/card";
import { carouselCategories } from "@/components/saved-content/CarouselCategories";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";

interface SavedContentListProps {
  content: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
}

export const SavedContentList = ({ 
  content, 
  onItemSelect, 
  selectedItemId 
}: SavedContentListProps) => {
  const transformToHistoryItems = (items: SavedContent[], type: SavedContent['type']): SavedContent[] => {
    const category = carouselCategories.find(cat => cat.type === type);
    if (!category) return [];

    return items
      .filter(item => item.type === type)
      .map(item => ({
        ...item,
        type: type,
        tags: [{
          label: category.displayType,
          ...category.colorScheme
        }]
      }));
  };

  return (
    <div className="space-y-8">
      {carouselCategories.map(category => {
        const items = transformToHistoryItems(content, category.type);
        
        return (
          <div key={category.type} className="space-y-4">
            <h2 className="text-xl font-semibold">{category.title}</h2>
            {items.length > 0 ? (
              <HistoryCarousel
                items={items}
                onItemSelect={onItemSelect}
                selectedItemId={selectedItemId}
              />
            ) : (
              <Card className="p-8 text-center text-muted-foreground bg-gray-50">
                <p>{category.emptyMessage}</p>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
};
