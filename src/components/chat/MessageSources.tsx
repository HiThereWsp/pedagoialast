import { WebSourcePreview } from "./WebSourcePreview"

interface MessageSourcesProps {
  sources: Array<{ id: number; url: string }>;
  isWebSearch?: boolean;
}

export const MessageSources = ({ sources, isWebSearch }: MessageSourcesProps) => {
  console.log('MessageSources props:', { sources, isWebSearch }); // Debug log
  
  if (!sources.length || !isWebSearch) {
    console.log('MessageSources not rendering:', { noSources: !sources.length, notWebSearch: !isWebSearch }); // Debug log
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-search-accent">Sources :</p>
      <div className="grid grid-cols-1 gap-3">
        {sources.map((source) => {
          console.log('Rendering source:', source); // Debug log
          return (
            <WebSourcePreview key={source.id} url={source.url} />
          );
        })}
      </div>
    </div>
  );
};