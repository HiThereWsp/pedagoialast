import React from 'react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { History } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SavedContent } from '@/types/saved-content';
interface HistoryCarouselProps {
  items: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
  formatContent?: (content: string) => string;
}
const defaultFormatContent = (content: string | null) => {
  if (!content) return '';
  return content;
};
export const HistoryCarousel = ({
  items,
  onItemSelect,
  selectedItemId,
  formatContent = defaultFormatContent
}: HistoryCarouselProps) => {
  const getRelativeDate = (date: string) => {
    return formatDistanceToNowStrict(new Date(date), {
      addSuffix: true,
      locale: fr
    }).replace('dans ', 'il y a ');
  };
  const renderContent = (item: SavedContent) => {
    if (item.type === 'Image') {
      return <div className="flex-grow h-40 relative">
          <img src={item.content} alt={item.title} className="w-full h-full object-cover rounded-md" />
        </div>;
    }
    return <div className="text-sm line-clamp-6 prose prose-sm max-w-none flex-grow overflow-y-auto" dangerouslySetInnerHTML={{
      __html: formatContent(item.content).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    }} />;
  };
  return <div className="relative bg-white rounded-xl shadow-sm border border-pink-100 p-6">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        
      </div>
      
      {items && items.length > 0 ? <Carousel opts={{
      align: "start",
      loop: items.length > 3
    }} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map(item => <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className={`h-[280px] p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedItemId === item.id ? 'border-primary' : ''}`} onClick={() => onItemSelect(item)}>
                  <div className="h-full flex flex-col">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span className="shrink-0">
                        {getRelativeDate(item.created_at)}
                      </span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {item.tags?.map((tag, index) => <span key={index} className="shrink-0 px-2 py-1 rounded-full text-xs" style={{
                    backgroundColor: tag.backgroundColor || '#FF9EBC20',
                    color: tag.color || '#FF9EBC',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: tag.borderColor || '#FF9EBC4D'
                  }}>
                            {tag.label}
                          </span>)}
                        {item.subject && <span className="shrink-0 px-2 py-1 bg-primary/10 rounded-full text-xs">
                            {item.subject}
                          </span>}
                      </div>
                    </div>
                    {renderContent(item)}
                  </div>
                </Card>
              </CarouselItem>)}
          </CarouselContent>
          {items.length > 1 && <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>}
        </Carousel> : <p className="text-center text-muted-foreground">
          Aucun élément dans l'historique
        </p>}
    </div>;
};