import React from 'react';
import DOMPurify from 'dompurify';
import { MarkdownContent } from './MarkdownContent';
import { formatContentWithSources } from '@/utils/messageFormatting';

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
  const formattedContent = formatContentWithSources(sanitizedContent, sources);

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
      
      <MarkdownContent content={formattedContent} />

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