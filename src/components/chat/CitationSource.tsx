interface CitationSourceProps {
  citationId: number;
  url: string;
}

export const CitationSource = ({ citationId, url }: CitationSourceProps) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">Source [{citationId}]</h4>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
      >
        {url}
      </a>
    </div>
  );
};