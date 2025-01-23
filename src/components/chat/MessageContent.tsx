import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  content: string;
  onCitationClick: (citationNumber: number) => void;
  selectedCitation: number | null;
}

export const MessageContent = ({ content, onCitationClick, selectedCitation }: MessageContentProps) => {
  return (
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
          <ul className="mb-4 space-y-1 list-none pl-5">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 pl-5 list-decimal space-y-1">
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="relative flex gap-2">
            {!props.ordered && (
              <span className="absolute left-[-1.25rem] top-[0.6rem] w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
            )}
            <span className="flex-grow">{children}</span>
          </li>
        ),
        a: ({ children, href }) => {
          // Gérer les citations au format [X]
          const citationMatch = href?.match(/\[(\d+)\]/);
          if (citationMatch) {
            const citationNumber = parseInt(citationMatch[1]);
            return (
              <button
                onClick={() => onCitationClick(citationNumber)}
                className={`inline-flex items-center ${
                  selectedCitation === citationNumber 
                    ? 'text-blue-800 font-semibold' 
                    : 'text-blue-600'
                } hover:text-blue-800 hover:underline`}
              >
                [{citationNumber}]
              </button>
            );
          }
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {children}
            </a>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};