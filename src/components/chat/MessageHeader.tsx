import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"

interface MessageHeaderProps {
  isWebSearch?: boolean;
}

export const MessageHeader = ({ isWebSearch }: MessageHeaderProps) => {
  if (!isWebSearch) return null;

  return (
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="secondary" className="bg-search-accent/10 text-search-accent flex items-center gap-1">
        <Globe className="w-3 h-3" />
        Recherche Web
      </Badge>
    </div>
  );
};