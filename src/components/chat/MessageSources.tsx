import { WebSourcePreview } from "./WebSourcePreview"

interface MessageSourcesProps {
  sources: Array<{ id: number; url: string }>;
  isWebSearch?: boolean;
}

export const MessageSources = ({ sources, isWebSearch }: MessageSourcesProps) => {
  if (!sources.length || !isWebSearch) return null;

  return (
    <div className="mt-4 pt-3 border-t border-search-accent/20">
      <p className="text-sm font-medium text-search-accent mb-2">Sources :</p>
      <div className="space-y-1">
        {sources.map((source) => (
          <WebSourcePreview key={source.id} url={source.url} />
        ))}
      </div>
    </div>
  );
};