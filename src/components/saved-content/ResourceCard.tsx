
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { SavedContent } from "@/types/saved-content";

interface ResourceCardProps {
  resource: SavedContent;
  onSelect: (item: SavedContent) => void;
}

export const ResourceCard = ({ resource, onSelect }: ResourceCardProps) => {
  return (
    <Card 
      onClick={() => onSelect(resource)}
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden hover:border-blue-500"
    >
      {resource.type === 'Image' ? (
        <div className="aspect-square">
          <img 
            src={resource.content} 
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <CardHeader>
          <h3 className="font-bold text-lg line-clamp-2">{resource.title}</h3>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {resource.subject && (
            <span className="text-sm text-gray-600">
              {resource.subject}
            </span>
          )}
          {resource.class_level && (
            <span className="text-sm text-gray-600">
              {resource.class_level}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {resource.tags?.map((tag, index) => (
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
      </CardContent>
    </Card>
  );
};
