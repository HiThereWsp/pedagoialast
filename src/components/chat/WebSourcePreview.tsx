import { Globe } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
      console.error('Invalid URL:', url);
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      console.error('Invalid URL for favicon:', url);
      return '';
    }
  };

  console.log('WebSourcePreview props:', { url, domain: getDomainFromUrl(url) }); // Debug log

  const domain = getDomainFromUrl(url);
  const faviconUrl = getFaviconUrl(url);
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline transition-transform hover:-translate-y-1"
    >
      <Card className="overflow-hidden border border-gray-200 hover:border-search-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-50">
              {!imageError ? (
                <img
                  src={faviconUrl}
                  alt={`${domain} favicon`}
                  className="w-4 h-4 object-contain"
                  onError={() => {
                    console.log('Favicon load error for:', url); // Debug log
                    setImageError(true);
                  }}
                />
              ) : (
                <Globe className="w-4 h-4 text-search-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {domain}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {url}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};