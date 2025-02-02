import { useMemo } from 'react';

export const useMessageProcessing = (content: string | undefined) => {
  const extractSources = (text: string | undefined) => {
    if (!text) {
      console.log('No text provided to extractSources');
      return [];
    }
    
    const sourceRegex = /(?:Source )?\[(\d+)\]:\s*(https?:\/\/[^\s\n]+)/g;
    const sources: { id: number; url: string }[] = [];
    let match;
    
    while ((match = sourceRegex.exec(text)) !== null) {
      sources.push({
        id: parseInt(match[1]),
        url: match[2].trim()
      });
    }
    
    console.log('Extracted sources:', sources);
    return sources;
  };

  const formatMessage = (text: string | undefined) => {
    if (!text) {
      console.log('No text provided to formatMessage');
      return '';
    }

    // Ensure we're working with a string
    const stringContent = String(text);
    
    return stringContent
      .replace(/(?:Source )?\[(\d+)\]:\s*https?:\/\/[^\s\n]+\n?/g, '')
      .trim();
  };

  const sources = useMemo(() => extractSources(content), [content]);
  const formattedContent = useMemo(() => formatMessage(content), [content]);

  return {
    sources,
    formattedContent
  };
};