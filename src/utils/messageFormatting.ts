export const formatContentWithSources = (content: string, sources?: Array<{ url: string }>) => {
  if (!sources) return content;
  
  let formattedContent = content;
  
  // Remove the "Sources utilisées :" section if it exists
  formattedContent = formattedContent.split(/Sources utilisées :/).shift() || formattedContent;
  
  // Remove any [object Object] artifacts
  formattedContent = formattedContent.replace(/,\s*\[object Object\]/g, '');
  
  // Clean up any trailing commas
  formattedContent = formattedContent.replace(/,\s*$/g, '');
  
  // Remove any empty source brackets
  formattedContent = formattedContent.replace(/\[\d+\]\s*,/g, '[$1]');
  
  return formattedContent.trim();
};

export const extractSources = (text: string) => {
  const sourceRegex = /(?:Source )?\[(\d+)\]:\s*(https?:\/\/[^\s\n]+)/g;
  const sources: { id: number; url: string }[] = [];
  let match;
  
  while ((match = sourceRegex.exec(text)) !== null) {
    sources.push({
      id: parseInt(match[1]),
      url: match[2].trim()
    });
  }
  
  return sources;
};

export const formatMessage = (content: string) => {
  return content
    .replace(/(?:Source )?\[(\d+)\]:\s*https?:\/\/[^\s\n]+\n?/g, '')
    .trim();
};