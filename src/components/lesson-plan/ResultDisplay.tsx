import React from 'react';
import { Card } from "@/components/ui/card";

interface ResultDisplayProps {
  lessonPlan: string | null;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  if (!lessonPlan) return null;

  return (
    <Card className="bg-white p-6 rounded-xl border border-[#FDE1D3] shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-[#FF9B9B]">
        Séquence pédagogique générée
      </h2>
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-[#FEF7CD]/30 p-4 rounded-lg border border-[#FDE1D3]">
          {lessonPlan}
        </pre>
      </div>
    </Card>
  );
}