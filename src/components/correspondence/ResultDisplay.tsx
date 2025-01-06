import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThumbsDown, Heart, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ResultDisplayProps {
  text: string;
}

export function ResultDisplay({ text }: ResultDisplayProps) {
  const { toast } = useToast();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1;
    
    try {
      setFeedbackScore(score);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          message: text,
          feedback_score: score,
          message_type: 'correspondence'
        });

      if (error) throw error;

      toast({
        description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour",
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err);
      setFeedbackScore(null);
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre retour",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        description: "Texte copié dans le presse-papier",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du texte",
      });
    }
  };

  if (!text) return null;

  return (
    <Card className="relative bg-white p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
          Votre correspondance est prête
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFeedback('like')}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-emerald-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === 1 && "text-emerald-500"
            )}
            aria-label="J'aime"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-red-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === -1 && "text-red-500"
            )}
            aria-label="Je n'aime pas"
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110",
              isCopied && "text-blue-500"
            )}
            aria-label="Copier le texte"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap bg-white rounded-lg text-gray-700 leading-relaxed">
          {text}
        </div>
      </div>
    </Card>
  );
}