
import { type SavedContent } from "@/types/saved-content";
import { Card } from "@/components/ui/card";
import { carouselCategories } from "@/components/saved-content/CarouselCategories";

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
  return (
    <div className="space-y-8">
      {carouselCategories.map(category => {
        const items = content.filter(item => item.type === category.type);
        
        return (
          <div key={category.type} className="space-y-4">
            <h2 className="text-xl font-semibold">{category.title}</h2>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card 
                    key={item.id}
                    className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedItemId === item.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onItemSelect(item)}
                  >
                    {item.type === 'Image' ? (
                      <img 
                        src={item.content} 
                        alt={item.title}
                        className="w-full aspect-square object-cover rounded-md mb-4" 
                      />
                    ) : (
                      <div className="mb-4">
                        <h3 className="font-medium line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {item.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: tag.backgroundColor,
                            color: tag.color,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: tag.borderColor
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
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
