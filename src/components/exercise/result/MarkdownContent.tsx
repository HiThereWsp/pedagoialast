
import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div className="prose prose-sm max-w-none overflow-x-hidden">
      <ReactMarkdown
        components={{
          strong: ({ children }) => (
            <span className="font-semibold text-gray-900 bg-orange-50/50 px-1 rounded">
              {children}
            </span>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold mt-8 mb-6 text-gray-900 first:mt-0 border-b border-orange-100 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold mt-6 mb-4 text-gray-800 border-l-4 border-orange-200 pl-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold mt-4 mb-3 text-gray-800 flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:bg-orange-200 before:rounded-full">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-none mb-4 mt-2 space-y-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 mt-2 space-y-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 pl-6 relative flex items-start text-sm sm:text-base before:content-[''] before:absolute before:left-2 before:top-[0.6em] before:w-2 before:h-2 before:bg-orange-200 before:rounded-full">
              {children}
            </li>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
