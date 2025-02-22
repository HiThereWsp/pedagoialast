
import React, { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Copy, CopyCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSavedContent } from "@/hooks/useSavedContent";
import { FeedbackButtons } from "@/components/image-generation/FeedbackButtons";

interface ResultDisplayProps {
  text: string;
  recipientType?: string;
  tone?: string;
}

export function ResultDisplay({ text, recipientType, tone }: ResultDisplayProps) {
  const { toast } = useToast();
  const { saveCorrespondence } = useSavedContent();
  const [isCopied, setIsCopied] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  useEffect(() => {
    const saveContent = async () => {
      if (!text) return;

      try {
        setIsSaving(true);
        await saveCorrespondence({
          title: `Correspondance ${recipientType || ''} ${new Date().toLocaleDateString()}`,
          content: text,
          recipient_type: recipientType || 'non spécifié',
          tone: tone
        });

        toast({
          title: "Succès",
          description: "Votre correspondance a été sauvegardée automatiquement",
        });
      } catch (error) {
        console.error('Error saving correspondence:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde automatique",
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveContent();
  }, [text, recipientType, tone]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        description: "Contenu copié dans le presse-papier",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie dans le presse-papier",
      });
    }
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Résultat</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isCopied ? (
              <CopyCheck className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>Copier</span>
          </button>
          <FeedbackButtons imageUrl="" />
        </div>
      </div>
      <div className="whitespace-pre-wrap">{text}</div>
    </Card>
  );
}
