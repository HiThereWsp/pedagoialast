
import React from 'react';
import { ScrollCard } from './result/ScrollCard';

interface ResultDisplayProps {
  exercises: string | null;
}

export function ResultDisplay({ exercises }: ResultDisplayProps) {
  if (!exercises) return null;

  return (
    <ScrollCard
      exercises={exercises}
      showCorrection={true}
      className="print:block"
      customClass="text-left"
    />
  );
}
