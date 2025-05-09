import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { lessonPlansService } from "@/services/lesson-plans";
import ReactMarkdown from 'react-markdown';
import { Label } from "@/components/ui/label";

interface LessonPlanSelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const LessonPlanSelect = ({ value, onChange }: LessonPlanSelectProps) => {
  const [lastSelectedPlan, setLastSelectedPlan] = useState<string | null>(null);
  
  const { data: lessonPlans = [] } = useQuery({
    queryKey: ['saved-lesson-plans'],
    queryFn: async () => {
      const plans = await lessonPlansService.getAll();
      return plans;
    }
  });

  useEffect(() => {
    if (value === lastSelectedPlan) return;
    
    const selectedPlan = lessonPlans.find(plan => plan.id === value);
    if (selectedPlan) {
      setLastSelectedPlan(value);
      // Set subject to the lesson plan's subject
      onChange('subject', selectedPlan.subject || '');
      onChange('classLevel', selectedPlan.class_level || '');
    }
  }, [value, lessonPlans, onChange, lastSelectedPlan]);

  const handlePlanChange = (newValue: string) => {
    const val = newValue === "none" ? "" : newValue;
    onChange('selectedLessonPlan', val);
    
    if (newValue === "none") {
      setLastSelectedPlan(null);
      // Do NOT reset the subject and classLevel fields when deselecting
      // This allows the user to keep editing them
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="lessonPlan" className="text-gray-700">
          Séquence pédagogique (optionnel)
        </Label>
        <Select
          value={value || "none"}
          onValueChange={handlePlanChange}
        >
          <SelectTrigger id="lessonPlan" className="w-full transition-colors focus:border-pink-300">
            <SelectValue placeholder="Sélectionner une séquence..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune séquence</SelectItem>
            {lessonPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value && value !== "none" && (
        <Card className="p-4 bg-gray-50/80 backdrop-blur-sm">
          <div className="prose prose-sm max-w-none max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="select-text">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-left">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-left">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-left">{children}</h3>,
                  p: ({ children }) => <p className="text-sm mb-2 text-gray-700 text-left whitespace-pre-wrap">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-sm text-left">{children}</ul>,
                  li: ({ children }) => <li className="text-gray-700 text-sm text-left">{children}</li>,
                }}
              >
                {lessonPlans.find(plan => plan.id === value)?.content || ''}
              </ReactMarkdown>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
