
import { type SavedContent } from "@/types/saved-content";

interface ContentHistoryProps {
  title: string;
  type: string;
  items: SavedContent[];
  emptyMessage: string;
  colorScheme: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
}

export const ContentHistory = ({
  title,
  type,
  items,
  emptyMessage,
  colorScheme
}: ContentHistoryProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border"
            style={{
              borderColor: colorScheme.borderColor,
              backgroundColor: colorScheme.backgroundColor
            }}
          >
            <h3 className="font-medium mb-2">{item.title}</h3>
            {type === 'Image' ? (
              <img 
                src={item.content} 
                alt={item.title}
                className="w-full h-auto rounded-md"
              />
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.content}
              </p>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
