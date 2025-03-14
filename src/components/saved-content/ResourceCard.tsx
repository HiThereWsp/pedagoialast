
import React, { useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { type SavedContent } from "@/types/saved-content";
import { useIsMobile } from '@/hooks/use-mobile';

interface ResourceCardProps {
  resource: SavedContent;
  onSelect: (resource: SavedContent) => void;
  isSelected?: boolean;
}

export const ResourceCard = React.memo(({ 
  resource, 
  onSelect, 
  isSelected = false 
}: ResourceCardProps) => {
  const isMobile = useIsMobile();
  
  const handleSelect = useCallback(() => {
    onSelect(resource);
  }, [onSelect, resource]);

  const formatDate = (dateString?: string) => {
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
  };

  const getIconClass = (type?: string) => {
    switch (type) {
      case 'lesson-plan':
        return "text-blue-500";
      case 'exercise':
        return "text-green-500";
      case 'Image':
        return "text-purple-500";
      case 'correspondence':
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card 
      className={cn(
        "transition-shadow duration-200 hover:shadow-md flex flex-col h-full", 
        isSelected ? "ring-2 ring-[#FFA800]" : "",
        isMobile ? "w-full" : ""
      )}
    >
      <CardHeader className={`pb-3 ${isMobile ? 'p-4' : 'p-5'}`}>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold line-clamp-2 text-left`}>
          {resource.title || "Sans titre"}
        </CardTitle>
        <p className="text-xs text-muted-foreground pt-1 text-left">
          {formatDate(resource.created_at)}
        </p>
      </CardHeader>
      
      <CardContent className={`grow text-left ${isMobile ? 'px-4 pb-2' : 'px-5 py-0'}`}>
        <div className="flex items-start space-x-2 mb-2">
          <div className={`h-2 w-2 rounded-full mt-1.5 ${getIconClass(resource.type)}`} />
          <p className="text-sm text-muted-foreground">
            {resource.displayType || resource.type || "Ressource"}
          </p>
        </div>
        
        {resource.summary && (
          <p className="text-sm line-clamp-3 mt-2 text-gray-600 dark:text-gray-300">
            {resource.summary}
          </p>
        )}
      </CardContent>
      
      <CardFooter className={`${isMobile ? 'p-4 pt-2' : 'p-5 pt-3'} flex justify-end border-t mt-auto`}>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"} 
          onClick={handleSelect}
          className="w-full"
        >
          <Eye className="mr-2 h-4 w-4" />
          Voir le détail
        </Button>
      </CardFooter>
    </Card>
  );
});

ResourceCard.displayName = "ResourceCard";
