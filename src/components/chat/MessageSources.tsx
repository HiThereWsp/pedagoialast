import { WebSourcePreview } from "./WebSourcePreview"

interface MessageSourcesProps {
  sources: Array<{ id: number; url: string }>;
  isWebSearch?: boolean;
}

export const MessageSources = ({ sources, isWebSearch }: MessageSourcesProps) => {
  console.log('MessageSources - sources:', sources);
  console.log('MessageSources - isWebSearch:', isWebSearch);

  if (!sources.length || !isWebSearch) {
    console.log('MessageSources - No sources to display');
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-search-accent">Sources :</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source) => (
          <WebSourcePreview key={source.id} url={source.url} />
        ))}
      </div>
    </div>
  );
};