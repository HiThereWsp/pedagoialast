import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { ThumbsDown, Heart, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ResultDisplayProps {
  lessonPlan: string | undefined;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  const { toast } = useToast();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!lessonPlan) return null;

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1;
    
    try {
      setFeedbackScore(score);
      if (type === 'dislike') {
        setIsDialogOpen(true);
      } else {
        toast({
          description: "Merci pour votre retour positif !",
        });
      }
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
      await navigator.clipboard.writeText(lessonPlan);
      setIsCopied(true);
      toast({
        description: "Séquence copiée dans le presse-papier",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie de la séquence",
      });
    }
  };

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      console.log('Feedback submitted:', feedback);
      toast({
        description: "Merci pour votre retour détaillé",
      });
    }
    setIsDialogOpen(false);
    setFeedback("");
  };

  return (
    <>
      <Card className="relative bg-white p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Séquence pédagogique générée
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
              aria-label="Copier la séquence"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <span className="font-semibold text-gray-900 bg-orange-50/50 px-1 rounded">
                  {children}
                </span>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-8 mb-6 text-gray-900 first:mt-0 border-b border-orange-100 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800 border-l-4 border-orange-200 pl-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mt-4 mb-3 text-gray-800 flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:bg-orange-200 before:rounded-full">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-gray-700 leading-relaxed text-justify tracking-normal bg-white rounded-lg">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none mb-4 mt-2 space-y-2 text-gray-700 text-justify bg-white rounded-lg">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 mt-2 space-y-2 text-gray-700 text-justify bg-white rounded-lg">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1 text-justify pl-6 relative flex items-start before:content-[''] before:absolute before:left-2 before:top-[0.6em] before:w-2 before:h-2 before:bg-orange-200 before:rounded-full">
                  {children}
                </li>
              ),
            }}
          >
            {lessonPlan}
          </ReactMarkdown>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votre retour nous intéresse</DialogTitle>
            <DialogDescription>
              Aidez-nous à améliorer la qualité des séquences générées en nous expliquant ce qui ne vous convient pas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Décrivez ce qui pourrait être amélioré..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitFeedback}>
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
