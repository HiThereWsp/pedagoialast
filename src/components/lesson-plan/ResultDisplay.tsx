import React from 'react';
import { Card } from "@/components/ui/card";

interface ResultDisplayProps {
  lessonPlan: string | null;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  if (!lessonPlan) return null;

  return (
    <Card className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
        Séquence pédagogique générée
      </h2>
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
          {lessonPlan}
        </pre>
      </div>
    </Card>
  );
}