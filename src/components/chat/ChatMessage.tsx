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
    </div>
  )
}