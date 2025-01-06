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
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-800">{children}</h3>,
          p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed text-justify">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-700 text-justify">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-700 text-justify">{children}</ol>,
          li: ({ children }) => <li className="mb-1 text-justify">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}