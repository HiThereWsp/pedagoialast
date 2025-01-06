import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ResultDisplayProps {
  lessonPlan: string | null;
}

export function ResultDisplay({ lessonPlan }: ResultDisplayProps) {
  const [editedPlan, setEditedPlan] = useState(lessonPlan);

  if (!lessonPlan) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPlan(e.target.value);
  };

  return (
    <Card className="bg-white p-6 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#D946EF] to-pink-500 bg-clip-text text-transparent">
        Séquence pédagogique générée
      </h2>
      <div className="prose prose-sm max-w-none">
        <Textarea
          value={editedPlan || ''}
          onChange={handleChange}
          className="min-h-[500px] w-full font-mono text-sm leading-relaxed whitespace-pre-wrap bg-pink-50/50 p-4 rounded-lg border border-pink-100 focus:border-[#D946EF] focus:ring-[#D946EF]"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }}
        />
      </div>
    </Card>
  );
}