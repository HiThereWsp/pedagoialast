import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { FeedbackButtons } from "./FeedbackButtons"
import { useState } from "react"

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

  // Fonction pour extraire les citations du texte
  const extractCitations = (text: string) => {
    const citations = text.match(/\[\d+\]/g) || [];
    return citations.map(c => parseInt(c.replace(/[\[\]]/g, '')));
  };

  // Fonction pour extraire les sources du texte
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
  const citations = extractCitations(content);

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
              a: ({ children, href }) => {
                const citationMatch = href?.match(/\[(\d+)\]/);
                if (citationMatch) {
                  const citationNumber = parseInt(citationMatch[1]);
                  return (
                    <button
                      onClick={() => setSelectedCitation(selectedCitation === citationNumber ? null : citationNumber)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      [{citationNumber}]
                    </button>
                  );
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                    {children}
                  </a>
                );
              }
            }}
          >
            {formatMessage(content)}
          </ReactMarkdown>
        </div>

        {selectedCitation && sources.find(s => s.id === selectedCitation) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Source [{selectedCitation}]</h4>
            <a 
              href={sources.find(s => s.id === selectedCitation)?.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
            >
              {sources.find(s => s.id === selectedCitation)?.url}
            </a>
          </div>
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