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
        "group relative rounded-lg p-4 mb-8 transition-all backdrop-blur-sm",
        role === 'user' 
          ? 'ml-auto max-w-[80%] bg-white shadow-md border border-gray-100/20' 
          : 'mr-auto max-w-[80%] bg-gradient-to-r from-[#FEF7CD]/30 via-[#FFDEE2]/30 to-[#FEC6A1]/30 border border-[#FEF7CD]/10 shadow-sm'
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