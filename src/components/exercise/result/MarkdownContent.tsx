import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          strong: ({ children }) => <span className="font-bold text-gray-900">{children}</span>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-6 text-gray-900 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-3 text-gray-800">{children}</h3>,
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 leading-relaxed text-justify tracking-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 mt-2 space-y-2 text-gray-700 text-justify">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 mt-2 space-y-2 text-gray-700 text-justify">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1 text-justify pl-2">
              {children}
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}