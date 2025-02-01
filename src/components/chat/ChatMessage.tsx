import { cn } from "@/lib/utils"
import { useState } from "react"
import { FeedbackButtons } from "./FeedbackButtons"
import { MessageContent } from "./MessageContent"
import { MessageHeader } from "./MessageHeader"
import { MessageSources } from "./MessageSources"
import { extractSources, formatMessage } from "@/utils/messageFormatting"

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
  const sources = extractSources(content);
  const formattedContent = formatMessage(content);

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
            ? 'bg-search-light border border-search-accent/20'
            : 'bg-gray-50/80 backdrop-blur-sm'
      )}>
        {role === 'assistant' && (
          <>
            <MessageHeader isWebSearch={isWebSearch} />
            {isWebSearch && sources.length > 0 && (
              <div className="mb-4">
                <MessageSources sources={sources} isWebSearch={isWebSearch} />
              </div>
            )}
          </>
        )}
        
        <div className={cn(
          "leading-relaxed",
          role === 'user' ? 'text-gray-800' : 'text-gray-800'
        )}>
          <MessageContent 
            content={formattedContent}
            attachments={attachments}
            sources={sources.map(s => ({ url: s.url }))}
            onCitationClick={(citationNumber) => 
              setSelectedCitation(selectedCitation === citationNumber ? null : citationNumber)
            }
            selectedCitation={selectedCitation}
          />
        </div>

        {role === 'assistant' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FeedbackButtons messageId={index} content={content} />
          </div>
        )}
      </div>
    </div>
  );
};