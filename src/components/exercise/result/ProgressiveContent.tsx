
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
    if (!text) return '';
    
    // Enlever les ** superflus au début du texte
    let cleaned = text.replace(/^\*\*/, '');
    // Enlever les ** superflus à la fin du texte
    cleaned = cleaned.replace(/\*\*$/, '');
    // Remplacer les séries de ** par des simples *
    cleaned = cleaned.replace(/\*\*\*\*/g, '**');
    // Nettoyer les lignes vides avec des **
    cleaned = cleaned.replace(/^\*\*\s*\*\*$/gm, '');
    
    // Conversion basique des tableaux simples en listes
    if (cleaned.includes('|') && (cleaned.includes('---') || cleaned.includes('+-'))) {
      const lines = cleaned.split('\n');
      let newLines = [];
      let inTable = false;
      let tableHeader = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Détection des lignes de tableau
        if (line.includes('|')) {
          if (!inTable) {
            inTable = true;
            
            // Capture l'en-tête du tableau
            tableHeader = line.split('|')
              .map(cell => cell.trim())
              .filter(cell => cell !== '');
          } else if (line.match(/^\s*[+|-]{3,}\s*$/)) {
            // Ligne de séparation, à ignorer
            continue;
          } else {
            // Ligne de données du tableau
            const cells = line.split('|')
              .map(cell => cell.trim())
              .filter(cell => cell !== '');
            
            // Si on a un en-tête, on peut créer une liste avec des étiquettes
            if (tableHeader.length > 0 && cells.length === tableHeader.length) {
              const listItem = tableHeader.map((header, idx) => 
                `**${header}**: ${cells[idx] || ''}`
              ).join(', ');
              newLines.push(`- ${listItem}`);
            } else {
              // Sinon, juste une liste simple
              newLines.push(`- ${cells.join(', ')}`);
            }
          }
        } else {
          // Ligne normale, pas dans un tableau
          if (inTable) {
            inTable = false;
            tableHeader = [];
          }
          newLines.push(line);
        }
      }
      
      cleaned = newLines.join('\n');
    }
    
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
            <h1 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2 print:text-xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-medium mb-3 text-gray-800 print:text-lg">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-md font-medium mb-2 text-gray-800 print:text-md">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-gray-700 leading-relaxed print:text-sm">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-3 space-y-1 text-gray-700 print:text-sm">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-3 space-y-1 text-gray-700 print:text-sm">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1 print:text-sm">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 print:text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 whitespace-normal text-sm">{children}</td>
          ),
          code: ({ node, className, children, ...props }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          ),
        }}
      >
        {cleanMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
