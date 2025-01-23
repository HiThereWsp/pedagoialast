import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { CitationSource } from './CitationSource';

interface MessageContentProps {
  content: string;
  attachments?: Array<{
    url: string;
    fileName?: string;
    fileType?: string;
  }>;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  onCitationClick?: (citationNumber: number) => void;
  selectedCitation?: number | null;
}

export const MessageContent = ({ 
  content, 
  attachments, 
  sources,
  onCitationClick,
  selectedCitation 
}: MessageContentProps) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div className="space-y-4">
      {attachments?.map((attachment, index) => {
        if (attachment.fileType?.startsWith('image/') || attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <div key={index} className="rounded-lg overflow-hidden max-w-2xl">
              <img 
                src={attachment.url} 
                alt={attachment.fileName || 'Generated image'} 
                className="w-full h-auto object-cover"
              />
            </div>
          );
        }
        return null;
      })}
      
      <div className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100">
        <ReactMarkdown components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="my-0" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-4 my-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-4 my-2" />
          ),
          code: ({ node, className, children, ...props }) => (
            className ? 
              <code {...props} className="bg-gray-100 rounded px-1 py-0.5">{children}</code> :
              <code {...props} className="block bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">{children}</code>
          )
        }}>
          {sanitizedContent}
        </ReactMarkdown>
      </div>

      {sources && sources.length > 0 && (
        <div className="mt-4 space-y-2">
          {sources.map((source, index) => (
            <CitationSource 
              key={index} 
              citationId={index + 1}
              title={source.title}
              url={source.url}
              snippet={source.snippet}
            />
          ))}
        </div>
      )}
    </div>
  );
};