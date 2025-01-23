export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    filePath: string;
  }>;
  isWebSearch?: boolean;
}