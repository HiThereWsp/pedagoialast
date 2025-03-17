
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToolMetrics } from "@/hooks/useToolMetrics";

interface ContentFeedbackProps {
  contentType: 'lesson_plan' | 'exercise' | 'correspondence' | 'image_generation';
  contentId?: string;
  className?: string;
}

export const ContentFeedback = ({ contentType, contentId, className }: ContentFeedbackProps) => {
  const { toast } = useToast();
  const { logToolUsage, isLoading } = useToolMetrics();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const newScore = type === 'like' ? 1 : -1;
    
    // If already selected the same type, deselect it
    if (feedbackScore === newScore) {
      setFeedbackScore(null);
      return;
    }
    
    setFeedbackScore(newScore);
    
    // For negative feedback, open dialog for additional comments
    if (type === 'dislike') {
      setIsDialogOpen(true);
    } else {
      // For positive feedback, log immediately
      try {
        await logToolUsage(
          contentType, 
          'feedback', 
          undefined, 
          undefined, 
          newScore,
          contentId
        );
        
        toast({
          description: "Merci pour votre retour positif !",
        });
      } catch (error) {
        console.error('Error logging feedback:', error);
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de l'enregistrement de votre retour",
        });
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      // Log the negative feedback with comments
      await logToolUsage(
        contentType,
        'feedback',
        feedback.length > 0 ? feedback.length : undefined,
        undefined,
        feedbackScore,
        contentId,
        feedback.length > 0 ? feedback : undefined
      );
      
      toast({
        description: "Merci pour votre retour, nous allons nous améliorer.",
      });
    } catch (error) {
      console.error('Error logging feedback with comments:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de l'enregistrement de votre retour",
      });
    } finally {
      setFeedback("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFeedback('like')}
        disabled={isLoading}
        className={cn(
          "text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors",
          feedbackScore === 1 && "text-emerald-500 bg-emerald-50"
        )}
      >
        <ThumbsUp className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFeedback('dislike')}
        disabled={isLoading}
        className={cn(
          "text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors",
          feedbackScore === -1 && "text-red-500 bg-red-50"
        )}
      >
        <ThumbsDown className="h-5 w-5" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votre avis nous intéresse</DialogTitle>
            <DialogDescription>
              N'hésitez pas à nous donner plus de détails sur votre expérience
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Partagez votre retour d'expérience..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleFeedbackSubmit} disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
