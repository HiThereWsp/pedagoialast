import { Globe } from "lucide-react";
import { useState } from "react";

interface WebSourcePreviewProps {
  url: string;
}

export const WebSourcePreview = ({ url }: WebSourcePreviewProps) => {
  const [imageError, setImageError] = useState(false);

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return '';
    }
  };

  const domain = getDomainFromUrl(url);
  const faviconUrl = getFaviconUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-search-light transition-colors duration-200 group"
    >
      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        {!imageError ? (
          <img
            src={faviconUrl}
            alt={`${domain} favicon`}
            className="w-4 h-4 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Globe className="w-4 h-4 text-search-accent" />
        )}
      </div>
      <span className="text-sm text-gray-700 group-hover:text-search-accent truncate flex-1">
        {domain}
      </span>
    </a>
  );
};