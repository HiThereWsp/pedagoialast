import { cn } from "@/lib/utils"
import { useState } from "react"
import { FeedbackButtons } from "./FeedbackButtons"
import { MessageContent } from "./MessageContent"
import { CitationSource } from "./CitationSource"
import { MessageHeader } from "./MessageHeader"
import { MessageSources } from "./MessageSources"
import { MessageAttachments } from "./MessageAttachments"

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
    // Amélioration du regex pour capturer les différents formats de sources
    const sourceRegex = /(?:Source )?\[(\d+)\]:\s*(https?:\/\/[^\s\n]+)/g;
    const sources: { id: number; url: string }[] = [];
    let match;
    
    while ((match = sourceRegex.exec(text)) !== null) {
      sources.push({
        id: parseInt(match[1]),
        url: match[2].trim()
      });
    }
    
    console.log('Extracted sources:', sources); // Debug log
    return sources;
  };

  const formatMessage = (content: string) => {
    // Nettoyer le message en retirant les références aux sources tout en gardant les citations
    const formattedContent = content
      .replace(/(?:Source )?\[(\d+)\]:\s*https?:\/\/[^\s\n]+\n?/g, '')
      .replace(/\[(\d+)\]/g, (match) => `[${match.slice(1, -1)}]`)
      .trim();
    
    console.log('Formatted content:', formattedContent); // Debug log
    return formattedContent;
  };

  const sources = extractSources(content);
  console.log('Is web search?', isWebSearch); // Debug log
  console.log('Sources length:', sources.length); // Debug log

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
        {role === 'assistant' && <MessageHeader isWebSearch={isWebSearch} />}
        
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

        {sources.length > 0 && isWebSearch && (
          <div className="mt-4 pt-3 border-t border-search-accent/20">
            <MessageSources sources={sources} isWebSearch={isWebSearch} />
          </div>
        )}

        <MessageAttachments attachments={attachments} />

        {role === 'assistant' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FeedbackButtons messageId={index} content={content} />
          </div>
        )}
      </div>
    </div>
  );
};