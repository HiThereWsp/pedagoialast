import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { FeedbackButtons } from "./FeedbackButtons"

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  index: number
}

export const ChatMessage = ({ role, content, index }: ChatMessageProps) => {
  const formatMessage = (content: string) => {
    return content
      .replace(/###/g, "")
      .replace(/\*\*/g, "**")
      .trim()
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg p-4 transition-all shadow-premium hover:shadow-premium-lg",
        role === 'user' 
          ? 'ml-auto max-w-[80%] bg-premium-gradient' 
          : 'mr-auto max-w-[80%] bg-white/80 backdrop-blur-sm'
      )}
    >
      <div className="text-foreground whitespace-pre-wrap leading-relaxed">
        <ReactMarkdown
          components={{
            strong: ({ children }) => <span className="font-bold">{children}</span>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
          }}
        >
          {formatMessage(content)}
        </ReactMarkdown>
      </div>

      {role === 'assistant' && (
        <FeedbackButtons messageId={index} content={content} />
      )}
    </div>
  )
}