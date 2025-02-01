import React from 'react';
import ReactMarkdown from 'react-markdown';
import { componentDecorator } from './LinkDecorator';
import Linkify from 'react-linkify';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="prose prose-sm max-w-none">
      <Linkify componentDecorator={componentDecorator}>
        <ReactMarkdown components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="my-1" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-4 my-2 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-4 my-2 space-y-1" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="my-2 leading-relaxed" />
          ),
          code: ({ node, className, children, ...props }) => (
            className ? 
              <code {...props} className="bg-gray-100 rounded px-1 py-0.5">{children}</code> :
              <code {...props} className="block bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">{children}</code>
          )
        }}>
          {content}
        </ReactMarkdown>
      </Linkify>
    </div>
  );
};