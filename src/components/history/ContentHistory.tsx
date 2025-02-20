
import React from 'react';
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ContentHistoryProps {
  title: string;
  type: string;
  items: any[];
  onDelete?: (id: string) => Promise<void>;
  onItemClick?: (item: any) => void;
  emptyMessage: string;
  colorScheme: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
}

export function ContentHistory({ 
  title, 
  items, 
  onDelete, 
  onItemClick,
  emptyMessage, 
  colorScheme 
}: ContentHistoryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card 
            key={item.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
            style={{ borderLeftColor: colorScheme.color }}
            onClick={() => onItemClick ? onItemClick(item) : null}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium line-clamp-2">{item.title}</h3>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {item.tags?.map((tag: any, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    color: tag.color,
                    backgroundColor: tag.backgroundColor,
                    borderColor: tag.borderColor,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {item.formattedDate}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
