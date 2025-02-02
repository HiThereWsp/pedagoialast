import { cn } from "@/lib/utils";
import { MessageWrapper } from "./MessageWrapper";

interface ChatMessageProps {
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

export const ChatMessage = ({ 
  role, 
  content, 
  index, 
  attachments, 
  isWebSearch 
}: ChatMessageProps) => {
  return (
    <div className={cn(
      "group relative px-4 mb-4",
      role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'
    )}>
      <MessageWrapper
        role={role}
        content={content}
        index={index}
        attachments={attachments}
        isWebSearch={isWebSearch}
      />
    </div>
  );
};