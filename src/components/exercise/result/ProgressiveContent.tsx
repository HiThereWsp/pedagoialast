
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

interface ProgressiveContentProps {
  content: string;
  className?: string;
}

export function ProgressiveContent({ content, className }: ProgressiveContentProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fonction pour nettoyer le Markdown
  const cleanMarkdown = (text: string) => {
    // Enlever les ** superflus au début du texte
    let cleaned = text.replace(/^\*\*/, '');
    // Enlever les ** superflus à la fin du texte
    cleaned = cleaned.replace(/\*\*$/, '');
    // Remplacer les séries de ** par des simples *
    cleaned = cleaned.replace(/\*\*\*\*/g, '**');
    // Nettoyer les lignes vides avec des **
    cleaned = cleaned.replace(/^\*\*\s*\*\*$/gm, '');
    return cleaned;
  };

  return (
    <div className={cn(
      "prose prose-sm max-w-none transition-opacity duration-500",
      isLoaded ? "opacity-100" : "opacity-0",
      className
    )}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-medium mb-3 text-gray-800">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-gray-700 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-3 space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-3 space-y-1 text-gray-700">
              {children}
            </ol>
          ),
        }}
      >
        {cleanMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
