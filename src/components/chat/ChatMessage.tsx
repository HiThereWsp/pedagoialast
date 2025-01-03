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
        "group relative rounded-lg p-4 mb-8 transition-all",
        role === 'user' 
          ? 'ml-auto max-w-[80%] bg-[#F3F4F6] dark:bg-gray-800' 
          : 'mr-auto max-w-[80%] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="text-foreground whitespace-pre-wrap leading-7">
        <ReactMarkdown
          components={{
            strong: ({ children }) => <span className="font-semibold">{children}</span>,
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            code: ({ children }) => (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto">
                {children}
              </pre>
            )
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