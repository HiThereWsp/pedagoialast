import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ResultDisplayProps {
  correspondence: string;
}

export function ResultDisplay({ correspondence }: ResultDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(correspondence);
      setIsCopied(true);
      toast({
        description: "Message copié dans le presse-papier",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du message",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Message généré par PedagoIA',
        text: correspondence,
      });
      toast({
        description: "Merci d'avoir partagé ce message !",
      });
    } catch (err) {
      await handleCopy();
      toast({
        description: "Le message a été copié, vous pouvez maintenant le partager",
      });
    }
  };

  return (
    <Card className="relative bg-white p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
          Message généré
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              "hover:bg-orange-50 transition-colors",
              isCopied && "text-green-500"
            )}
          >
            <Copy className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="hover:bg-orange-50 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="mb-4 text-gray-700 leading-relaxed text-justify tracking-normal">
                {children}
              </p>
            ),
          }}
        >
          {correspondence}
        </ReactMarkdown>
      </div>
    </Card>
  );
}