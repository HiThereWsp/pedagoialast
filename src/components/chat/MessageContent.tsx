import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import Linkify from 'react-linkify';
import { CitationSource } from './CitationSource';

interface MessageContentProps {
  content: string;
  attachments?: Array<{
    url: string;
    fileName?: string;
    fileType?: string;
  }>;
  sources?: Array<{
    url: string;
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
  
  const formatContentWithSources = (content: string) => {
    if (!sources) return content;
    
    let formattedContent = content;
    formattedContent = formattedContent.split(/Sources utilisées :/).shift() || formattedContent;
    formattedContent = formattedContent.replace(/,\s*\[object Object\]/g, '');
    
    return formattedContent.trim();
  };

  const componentDecorator = (href: string, text: string, key: number) => (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
      {text}
    </a>
  );

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
            {formatContentWithSources(sanitizedContent)}
          </ReactMarkdown>
        </Linkify>
      </div>

      {sources && sources.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-search-accent mb-2">Sources :</p>
          <div className="space-y-2">
            {sources.map((source, index) => (
              <div key={index} className="text-sm">
                <a 
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-search-accent transition-colors duration-200"
                >
                  [{index + 1}] {source.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};