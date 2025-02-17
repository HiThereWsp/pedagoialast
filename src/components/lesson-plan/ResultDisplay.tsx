
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lessonPlan }} />
        </div>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleGenerateExercise}
          className="bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 text-white"
        >
          Générer un exercice à partir de cette séquence
        </Button>
      </div>
    </div>
  );
}
