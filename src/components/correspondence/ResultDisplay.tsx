
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSavedContent } from "@/hooks/useSavedContent";

interface ResultDisplayProps {
  text: string;
  recipientType?: string;
  tone?: string;
}

export function ResultDisplay({ text, recipientType, tone }: ResultDisplayProps) {
  const { toast } = useToast();
  const { saveCorrespondence } = useSavedContent();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
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
        description: "Votre correspondance a été sauvegardée avec succès",
      });
    } catch (error) {
      console.error('Error saving correspondence:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Résultat</h3>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
      <div className="whitespace-pre-wrap">{text}</div>
    </Card>
  );
}
