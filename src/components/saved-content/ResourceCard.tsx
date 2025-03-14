
import React, { useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { SavedContent } from "@/types/saved-content";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

interface ResourceCardProps {
  resource: SavedContent;
  onSelect: (item: SavedContent) => void;
  isSelected?: boolean;
}

export const ResourceCard = React.memo(({ 
  resource, 
  onSelect,
  isSelected = false
}: ResourceCardProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = useCallback(() => {
    onSelect(resource);
  }, [onSelect, resource]);

  return (
    <Card 
      onClick={handleClick}
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden hover:border-[#FFA800] bg-white dark:bg-gray-900 hover-lift",
        isSelected && "border-[#FFA800] ring-2 ring-[#FFA800]/20"
      )}
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
        <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {resource.title}
          </h3>
        </CardHeader>
      )}
      <CardContent className={`${isMobile ? 'p-4 pt-1' : 'p-6 pt-2'}`}>
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
          {resource.subject && (
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {resource.subject}
            </span>
          )}
          {resource.class_level && (
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {resource.class_level}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {resource.tags?.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full transition-colors"
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
});

ResourceCard.displayName = "ResourceCard";
