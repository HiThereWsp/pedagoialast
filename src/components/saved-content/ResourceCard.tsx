
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
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden hover:border-blue-500 bg-white dark:bg-gray-900"
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
        <CardHeader className="p-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {resource.title}
          </h3>
        </CardHeader>
      )}
      <CardContent className="p-6 pt-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {resource.subject && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resource.subject}
            </span>
          )}
          {resource.class_level && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resource.class_level}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.tags?.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-3 py-1 rounded-full transition-colors"
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
