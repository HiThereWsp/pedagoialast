import { WebSourcePreview } from "./WebSourcePreview"

interface MessageSourcesProps {
  sources: Array<{ id: number; url: string }>;
  isWebSearch?: boolean;
}

export const MessageSources = ({ sources, isWebSearch }: MessageSourcesProps) => {
  console.log('MessageSources - sources:', sources); // Debug log
  console.log('MessageSources - isWebSearch:', isWebSearch); // Debug log

  if (!sources.length || !isWebSearch) {
    console.log('MessageSources - No sources to display'); // Debug log
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-search-accent">Sources :</p>
      <div className="space-y-1">
        {sources.map((source) => (
          <WebSourcePreview key={source.id} url={source.url} />
        ))}
      </div>
    </div>
  );
};