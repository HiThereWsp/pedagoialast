
import React, { useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { type SavedContent } from "@/types/saved-content";
import { useIsMobile } from '@/hooks/use-mobile';
import { ColoredBadge } from "@/components/ui/colored-badge";

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

  // Color schemes for different tag types
  const getTagColorScheme = (tagType: string) => {
    // Subject colors (soft blue)
    if (tagType === 'subject') {
      return {
        color: '#2563EB',
        backgroundColor: '#DBEAFE',
        borderColor: '#93C5FD'
      };
    }
    // Class level colors (soft green)
    else if (tagType === 'class_level') {
      return {
        color: '#16A34A',
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC'
      };
    }
    // Content type colors (soft purple)
    else {
      return {
        color: '#9333EA',
        backgroundColor: '#F3E8FF',
        borderColor: '#D8B4FE'
      };
    }
  };

  // Get display type based on resource type
  const getDisplayType = (type?: string) => {
    switch (type) {
      case 'lesson-plan':
        return 'Séquence';
      case 'exercise':
        return 'Exercice';
      case 'Image':
        return 'Image';
      case 'correspondence':
        return 'Correspondance';
      default:
        return type || '';
    }
  };
  
  // Date display in a cleaner format for card content
  const formattedDate = formatDate(resource.created_at);

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md flex flex-col h-full", 
        isSelected ? "ring-2 ring-[#FFA800]" : "",
        isMobile ? "w-full" : ""
      )}
    >
      <CardHeader className={`${isMobile ? 'p-4 pb-2' : 'p-5 pb-3'}`}>
        <CardTitle className={`${isMobile ? 'text-base font-bold' : 'text-xl font-bold'} line-clamp-2 text-left`}>
          {resource.title || "Sans titre"}
        </CardTitle>
        <p className="text-xs text-muted-foreground text-left mt-1">
          {formattedDate}
        </p>
      </CardHeader>
      
      <CardContent className={`grow text-left ${isMobile ? 'px-4 py-2' : 'px-5 py-0'}`}>
        {resource.summary && (
          <p className="text-sm line-clamp-2 mt-2 text-gray-600 dark:text-gray-300">
            {resource.summary}
          </p>
        )}
        
        {/* Metadata tags with color coding and truncation */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {resource.subject && (
            <ColoredBadge
              label={resource.subject}
              maxLength={15}
              {...getTagColorScheme('subject')}
            />
          )}
          
          {resource.class_level && (
            <ColoredBadge
              label={resource.class_level}
              maxLength={12}
              {...getTagColorScheme('class_level')}
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`${isMobile ? 'p-4 pt-2' : 'p-5 pt-3'} flex justify-end border-t mt-auto`}>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"} 
          onClick={handleSelect}
          className="w-full"
        >
          <Eye className="mr-2 h-3.5 w-3.5" />
          Voir
        </Button>
      </CardFooter>
    </Card>
  );
});

ResourceCard.displayName = "ResourceCard";
