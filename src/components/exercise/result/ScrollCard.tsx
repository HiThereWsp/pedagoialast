
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Copy, Share2 } from "lucide-react";
import { MarkdownContent } from './MarkdownContent';

interface ScrollCardProps {
  exercises: string;
  onBack: () => void;
}

export const ScrollCard = ({ exercises, onBack }: ScrollCardProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exercises);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papier"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le contenu"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Exercice PédagoIA',
          text: exercises,
        });
        toast({
          title: "Partagé !",
          description: "Le contenu a été partagé avec succès"
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de partager le contenu"
          });
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <MarkdownContent content={exercises} />
      </div>
    </Card>
  );
};
