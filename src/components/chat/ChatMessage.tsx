import { cn } from "@/lib/utils"
import { useState } from "react"
import { FeedbackButtons } from "./FeedbackButtons"
import { MessageContent } from "./MessageContent"
import { CitationSource } from "./CitationSource"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import { WebSourcePreview } from "./WebSourcePreview"

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  index: number
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    filePath: string;
  }>;
  isWebSearch?: boolean;
}

export const ChatMessage = ({ role, content, index, attachments, isWebSearch }: ChatMessageProps) => {
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

  const extractSources = (text: string) => {
    // Mise à jour de la regex pour capturer l'URL complète
    const sourceRegex = /Source \[(\d+)\]: (https?:\/\/[^\s\n]+)/g;
    const sources: { id: number; url: string }[] = [];
    let match;
    
    while ((match = sourceRegex.exec(text)) !== null) {
      sources.push({
        id: parseInt(match[1]),
        url: match[2].trim()
      });
    }
    
    return sources;
  };

  const formatMessage = (content: string) => {
    // Supprime les marqueurs de source du message principal
    return content
      .replace(/Source \[\d+\]: https?:\/\/[^\s\n]+\n?/g, '')
      .replace(/###/g, '')
      .replace(/\*\*/g, '**')
      .trim();
  };

  const sources = extractSources(content);

  return (
    <div className={cn(
      "group relative px-4 mb-4",
      role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'
    )}>
      <div className={cn(
        "rounded-2xl p-4",
        role === 'user' 
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-gray-800' 
          : isWebSearch 
            ? 'bg-search-light border-2 border-search-accent/20 shadow-lg'
            : 'bg-gray-50/80 backdrop-blur-sm'
      )}>
        {role === 'assistant' && isWebSearch && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-search-accent/10 text-search-accent flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Recherche Web
            </Badge>
          </div>
        )}
        
        <div className={cn(
          "whitespace-pre-wrap leading-relaxed",
          role === 'user' ? 'text-gray-800' : 'text-gray-800'
        )}>
          <MessageContent 
            content={formatMessage(content)}
            onCitationClick={(citationNumber) => 
              setSelectedCitation(selectedCitation === citationNumber ? null : citationNumber)
            }
            selectedCitation={selectedCitation}
          />
        </div>

        {selectedCitation && sources.find(s => s.id === selectedCitation) && (
          <CitationSource 
            citationId={selectedCitation}
            url={sources.find(s => s.id === selectedCitation)!.url}
          />
        )}

        {sources.length > 0 && role === 'assistant' && isWebSearch && (
          <div className="mt-4 pt-3 border-t border-search-accent/20">
            <p className="text-sm font-medium text-search-accent mb-2">Sources :</p>
            <div className="space-y-1">
              {sources.map((source, i) => (
                <WebSourcePreview key={i} url={source.url} />
              ))}
            </div>
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {attachments.map((attachment, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  {attachment.fileName}
                </a>
              </div>
            ))}
          </div>
        )}

        {role === 'assistant' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FeedbackButtons messageId={index} content={content} />
          </div>
        )}
      </div>
    </div>
  )
}