import { cn } from "@/lib/utils";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";
import { MessageSources } from "./MessageSources";
import { FeedbackButtons } from "./FeedbackButtons";
import { useMessageProcessing } from "@/hooks/chat/useMessageProcessing";

interface MessageWrapperProps {
  role: 'user' | 'assistant';
  content: string;
  index: number;
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    filePath: string;
  }>;
  isWebSearch?: boolean;
}

export const MessageWrapper = ({ 
  role, 
  content, 
  index, 
  attachments, 
  isWebSearch 
}: MessageWrapperProps) => {
  const { sources, formattedContent } = useMessageProcessing(content);
  
  console.log('Message props:', { role, content, isWebSearch, sourcesLength: sources.length });

  return (
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
        />
      </div>

      {role === 'assistant' && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FeedbackButtons messageId={index} content={content} />
        </div>
      )}
    </div>
  );
};