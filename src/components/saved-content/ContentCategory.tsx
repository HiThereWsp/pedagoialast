
import React from 'react';
import { Card } from "@/components/ui/card";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";
import { type SavedContent } from "@/types/saved-content";

interface ContentCategoryProps {
  title: string;
  type: string;
  emptyMessage: string;
  items: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
  colorMap: Record<string, { color: string; backgroundColor: string; borderColor: string; }>;
}

const ContentCategory = React.memo(({
  title,
  type,
  emptyMessage,
  items,
  onItemSelect,
  selectedItemId,
  colorMap
}: ContentCategoryProps) => {
  const transformedItems = React.useMemo(() => {
    return items
      .filter(item => item.type === type)
      .map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        subject: item.subject,
        created_at: item.created_at,
        tags: [{
          label: type,
          ...colorMap[type as keyof typeof colorMap]
        }]
      }));
  }, [items, type, colorMap]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {transformedItems.length > 0 ? (
        <HistoryCarousel
          items={transformedItems}
          onItemSelect={onItemSelect}
          selectedItemId={selectedItemId}
        />
      ) : (
        <Card className="p-8 text-center text-muted-foreground bg-gray-50">
          <p>{emptyMessage}</p>
        </Card>
      )}
    </div>
  );
});

ContentCategory.displayName = 'ContentCategory';

export default ContentCategory;
