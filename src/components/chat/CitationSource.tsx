interface CitationSourceProps {
  citationId: number;
  url: string;
}

export const CitationSource = ({ citationId, url }: CitationSourceProps) => {
  return (
    <div className="mt-2 text-sm">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-2 bg-white/50 p-2 rounded-xl"
      >
        <span className="font-medium">Source [{citationId}]</span>
        <span className="truncate flex-1">{url}</span>
      </a>
    </div>
  );
};