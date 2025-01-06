import React from 'react';
import { ThumbsDown, Heart, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackButtonsProps {
  feedbackScore: 1 | -1 | null;
  isCopied: boolean;
  onFeedback: (type: 'like' | 'dislike') => void;
  onCopy: () => void;
}

export function FeedbackButtons({ feedbackScore, isCopied, onFeedback, onCopy }: FeedbackButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFeedback('like')}
        className={cn(
          "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-emerald-500 transition-all duration-300 transform hover:scale-110",
          feedbackScore === 1 && "text-emerald-500"
        )}
        aria-label="J'aime"
      >
        <Heart className="h-5 w-5" />
      </button>
      <button
        onClick={() => onFeedback('dislike')}
        className={cn(
          "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-red-500 transition-all duration-300 transform hover:scale-110",
          feedbackScore === -1 && "text-red-500"
        )}
        aria-label="Je n'aime pas"
      >
        <ThumbsDown className="h-5 w-5" />
      </button>
      <button
        onClick={onCopy}
        className={cn(
          "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110",
          isCopied && "text-blue-500"
        )}
        aria-label="Copier les exercices"
      >
        <Copy className="h-5 w-5" />
      </button>
    </div>
  );
}