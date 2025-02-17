
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { AnimatedResultDisplay } from '@/components/shared/AnimatedResultDisplay';

interface ResultDisplayProps {
  lessonPlan: string;
  lessonPlanId?: string;
  subject?: string;
  classLevel?: string;
}

export function ResultDisplay({ lessonPlan, lessonPlanId, subject, classLevel }: ResultDisplayProps) {
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

  const formatContent = (content: string) => {
    const formattedContent = content
      .replace(/#{3,4}\s/g, '')
      .replace(/\*\*/g, '')
      .split('\n')
      .map(line => {
        if (line.includes('Séquence pédagogique')) {
          return `<h1 class="text-2xl font-bold mb-6">${line}</h1>`;
        }
        if (line.match(/^\d+\./)) {
          return `<h2 class="text-xl font-bold mt-8 mb-4">${line}</h2>`;
        }
        if (line.match(/^Phase \d+:/)) {
          return `<h3 class="text-lg font-bold mt-6 mb-3 text-black">${line}</h3>`;
        }
        if (line.match(/^Séance \d+/)) {
          return `<h4 class="font-bold mt-4 mb-2 text-black">${line}</h4>`;
        }
        if (line.trim().startsWith('-')) {
          return `<p class="ml-4 my-1 text-black">${line}</p>`;
        }
        return line ? `<p class="my-2 text-black">${line}</p>` : '<br/>';
      })
      .join('\n');

    return formattedContent;
  };

  const actions = lessonPlan ? (
    <Button
      onClick={handleGenerateExercise}
      className="bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 text-white"
    >
      Générer un exercice à partir de cette séquence
    </Button>
  ) : null;

  return (
    <AnimatedResultDisplay
      content={lessonPlan}
      formatContent={formatContent}
      actions={actions}
    />
  );
}
