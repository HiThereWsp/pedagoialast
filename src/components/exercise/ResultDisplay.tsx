
import React from 'react';
import { ScrollCard } from './result/ScrollCard';

interface ResultDisplayProps {
  exercises: string | null;
  exerciseId?: string;
}

export function ResultDisplay({ exercises, exerciseId }: ResultDisplayProps) {
  if (!exercises) return null;

  return (
    <ScrollCard
      exercises={exercises}
      showCorrection={true}
      className="print:block"
      customClass="text-left"
      contentType="exercise"
      contentId={exerciseId}
    />
  );
}
