interface MessageAttachmentsProps {
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    filePath: string;
  }>;
}

export const MessageAttachments = ({ attachments }: MessageAttachmentsProps) => {
  if (!attachments?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      {attachments.map((attachment, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
          <a 
            href={attachment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {attachment.fileName}
          </a>
        </div>
      ))}
    </div>
  );
};