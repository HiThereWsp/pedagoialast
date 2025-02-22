
import { Card } from "@/components/ui/card";
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SavedContent } from "@/types/saved-content";

interface ImageGridProps {
  images: SavedContent[];
}

export const ImageGrid = ({ images }: ImageGridProps) => {
  const getRelativeDate = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.error('Invalid date:', date);
        return 'Date invalide';
      }
      
      return formatDistanceToNowStrict(parsedDate, {
        addSuffix: true,
        locale: fr
      }).replace('dans ', 'il y a ');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  if (!images.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucune image générée pour le moment
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="p-4 flex flex-col gap-2">
          <img 
            src={image.content} 
            alt={image.title}
            className="w-full aspect-square object-cover rounded-md" 
          />
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-2">{image.title}</h3>
            <p className="text-sm text-muted-foreground">
              {getRelativeDate(image.created_at)}
            </p>
            <div className="flex gap-2">
              {image.tags?.map((tag, index) => (
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
          </div>
        </Card>
      ))}
    </div>
  );
};
