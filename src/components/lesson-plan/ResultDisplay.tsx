import React from 'react';
import { Card } from "@/components/ui/card";

interface ResultDisplayProps {
  lessonPlan: string | null;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  if (!lessonPlan) return null;

  return (
    <Card className="bg-white p-6 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#D946EF] to-pink-500 bg-clip-text text-transparent">
        Séquence pédagogique générée
      </h2>
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-pink-50/50 p-4 rounded-lg border border-pink-100">
          {lessonPlan}
        </pre>
      </div>
    </Card>
  );
}