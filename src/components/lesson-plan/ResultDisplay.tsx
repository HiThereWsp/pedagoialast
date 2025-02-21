
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { ThumbsDown, Heart, Copy, ArrowRightCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { useNavigate } from 'react-router-dom';

interface ResultDisplayProps {
  lessonPlan: string | undefined;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  if (!lessonPlan) return null;

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1;
    
    try {
      setFeedbackScore(score);
      await logToolUsage('lesson_plan', 'feedback', undefined, undefined, score);
      
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
      await logToolUsage('lesson_plan', 'copy', lessonPlan.length);
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

  const handleSubmitFeedback = async () => {
    if (feedback.trim()) {
      await logToolUsage('lesson_plan', 'feedback', feedback.length);
      toast({
        description: "Merci pour votre retour détaillé",
      });
    }
    setIsDialogOpen(false);
    setFeedback("");
  };

  const handleCreateExercise = () => {
    localStorage.setItem('selectedLessonPlan', lessonPlan);
    navigate('/exercise');
  };

  return (
    <>
      <Card className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Séquence pédagogique générée
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback('like')}
              className={cn(
                "rounded p-1.5 text-gray-400 hover:bg-gray-50 transition-all duration-300",
                feedbackScore === 1 && "text-emerald-500"
              )}
              aria-label="J'aime"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFeedback('dislike')}
              className={cn(
                "rounded p-1.5 text-gray-400 hover:bg-gray-50 transition-all duration-300",
                feedbackScore === -1 && "text-red-500"
              )}
              aria-label="Je n'aime pas"
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                "rounded p-1.5 text-gray-400 hover:bg-gray-50 transition-all duration-300",
                isCopied && "text-blue-500"
              )}
              aria-label="Copier la séquence"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none mb-6">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 first:mt-0 border-b border-gray-200 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-gray-700 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 mt-2 space-y-2 text-gray-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 mt-2 space-y-2 text-gray-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">
                  {children}
                </li>
              ),
            }}
          >
            {lessonPlan}
          </ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleCreateExercise}
            className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md group"
          >
            <ArrowRightCircle className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            Créer un exercice à partir de cette séquence
          </Button>
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
