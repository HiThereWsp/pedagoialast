
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { lessonPlansService } from "@/services/lesson-plans";
import ReactMarkdown from 'react-markdown';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const LessonPlanSelect = ({ value, onChange }: FieldProps) => {
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
      onChange('subject', selectedPlan.subject);
      onChange('classLevel', selectedPlan.class_level || '');
    }
  }, [value, lessonPlans, onChange, lastSelectedPlan]);

  const handlePlanChange = (newValue: string) => {
    const val = newValue === "none" ? "" : newValue;
    onChange('selectedLessonPlan', val);
    
    if (newValue === "none") {
      setLastSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Séquence pédagogique (optionnel)
        </label>
        <Select
          value={value || "none"}
          onValueChange={handlePlanChange}
        >
          <SelectTrigger className="w-full">
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
        <Card className="p-4 bg-gray-50">
          <div className="prose prose-sm max-w-none max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pointer-events-auto">
            <div className="select-text user-select-text">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-left select-text">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-left select-text">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-left select-text">{children}</h3>,
                  p: ({ children }) => <p className="text-sm mb-2 text-gray-700 text-left whitespace-pre-wrap select-text">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-sm text-left select-text">{children}</ul>,
                  li: ({ children }) => <li className="text-gray-700 text-sm text-left select-text">{children}</li>,
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
