
import React from 'react';
import { Sparkles } from "lucide-react";

interface HeaderSectionProps {
  exerciseCount: string;
}

export function HeaderSection({ exerciseCount }: HeaderSectionProps) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
        {exerciseCount?.includes('Exercice') ? "Votre exercice est prêt" : "Vos exercices sont prêts"}
      </h2>
      <Sparkles className="h-5 w-5 text-yellow-400" />
    </div>
  );
}
