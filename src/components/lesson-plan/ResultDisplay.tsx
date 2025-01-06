import React from 'react';

interface ResultDisplayProps {
  lessonPlan: string | null;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  if (!lessonPlan) return null;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Séquence pédagogique générée</h2>
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap text-sm">{lessonPlan}</pre>
      </div>
    </div>
  );
}