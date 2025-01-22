import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { FeedbackButtons } from "./FeedbackButtons"

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
              p: ({ children }) => <p className="mb-4 last:mb-0 text-justify">{children}</p>,
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-5 mb-3 text-gray-800">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 pl-6 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 pl-6 list-decimal space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="relative pl-2">
                  <span className="absolute left-[-1rem] top-[0.6rem] w-2 h-2 bg-[#FFDEE2] rounded-full"></span>
                  {children}
                </li>
              ),
            }}
          >
            {formatMessage(content)}
          </ReactMarkdown>
        </div>

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