import { cn } from "@/lib/utils"
import { useState } from "react"
import { FeedbackButtons } from "./FeedbackButtons"
import { MessageContent } from "./MessageContent"
import { CitationSource } from "./CitationSource"

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
}

export const ChatMessage = ({ role, content, index, attachments }: ChatMessageProps) => {
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

  const extractSources = (text: string) => {
    const sourceRegex = /Source \[(\d+)\]: (http[s]?:\/\/[^\s]+)/g;
    const sources: { id: number; url: string }[] = [];
    let match;
    
    while ((match = sourceRegex.exec(text)) !== null) {
      sources.push({
        id: parseInt(match[1]),
        url: match[2]
      });
    }
    
    return sources;
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/###/g, "")
      .replace(/\*\*/g, "**")
      .trim()
  };

  const sources = extractSources(content);

  return (
    <div
      className={cn(
        "group relative px-4 transition-all duration-300 hover:scale-[1.01]",
        role === 'user' 
          ? 'ml-auto max-w-[85%] md:max-w-[80%]' 
          : 'mr-auto max-w-[85%] md:max-w-[80%]'
      )}
    >
      <div className={cn(
        "rounded-2xl p-4 transition-all shadow-premium hover:shadow-premium-lg",
        role === 'user' 
          ? 'bg-white border border-gray-100/20' 
          : 'bg-gradient-to-r from-[#FFDEE2]/10 to-[#FEF7CD]/10 border border-[#FFDEE2]/20'
      )}>
        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
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
          <FeedbackButtons messageId={index} content={content} />
        )}
      </div>
    </div>
  )
}