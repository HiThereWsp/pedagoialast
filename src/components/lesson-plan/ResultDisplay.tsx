
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Copy, ArrowRightCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ContentFeedback } from "@/components/common/ContentFeedback";

interface ResultDisplayProps {
  lessonPlan: string;
  lessonPlanId?: string;
  subject?: string;
  classLevel?: string;
}

export function ResultDisplay({ lessonPlan, lessonPlanId, subject, classLevel }: ResultDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerateExercise = () => {
    navigate('/exercise', {
      state: {
        lessonPlanId,
        lessonPlanContent: lessonPlan,
        subject,
        classLevel
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lessonPlan);
    setIsCopied(true);
    toast({
      description: "La séquence a été copiée dans votre presse-papiers."
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Séquence pédagogique générée
        </h2>
        <div className="flex items-center gap-2">
          <ContentFeedback 
            contentType="lesson_plan" 
            contentId={lessonPlanId}
          />
          <button
            onClick={handleCopy}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-gray-50 transition-all duration-300",
              isCopied && "text-blue-500"
            )}
            aria-label="Copier le contenu"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none mb-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 first:mt-0">
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

      <div className="mt-6 pt-6 border-t border-gray-200">
        <Button
          onClick={handleGenerateExercise}
          className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <ArrowRightCircle className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          Créer un exercice à partir de cette séquence
        </Button>
      </div>
    </Card>
  );
}
