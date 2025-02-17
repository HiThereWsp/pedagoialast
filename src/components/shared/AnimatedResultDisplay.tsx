
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnimatedResultDisplayProps {
  content: string;
  isGenerating?: boolean;
  formatContent?: (content: string) => string;
  actions?: React.ReactNode;
  className?: string;
}

export function AnimatedResultDisplay({ 
  content, 
  isGenerating = false,
  formatContent = (content) => content,
  actions,
  className = ""
}: AnimatedResultDisplayProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typeContent = (content: string, index = 0) => {
    if (index <= content.length) {
      setDisplayedContent(content.slice(0, index));
      timeoutRef.current = setTimeout(() => {
        typeContent(content, index + 3);
      }, 1);
    } else {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (content) {
      setIsTyping(true);
      setDisplayedContent("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      typeContent(content);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className={`p-6 relative ${isTyping ? 'animate-pulse-subtle' : ''}`}>
        <div className="prose prose-headings:text-black prose-p:text-black max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: formatContent(displayedContent) }}
            className="space-y-2 text-black selection:bg-blue-100"
          />
        </div>
        {isGenerating && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">Génération en cours</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {content && !isTyping && actions && (
        <div className="flex justify-end space-x-4">
          {actions}
        </div>
      )}
    </div>
  );
}
