import React from 'react';
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  onShare: () => void;
}

export function ShareButton({ onShare }: ShareButtonProps) {
  return (
    <Button
      onClick={onShare}
      variant="outline"
      size="sm"
      className="gap-2 text-gray-600 hover:text-gray-900"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Partager avec un.e collègue</span>
    </Button>
  );
}