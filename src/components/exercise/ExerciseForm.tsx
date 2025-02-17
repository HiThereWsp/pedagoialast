
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateExerciseForm } from './form/GenerateExerciseForm';
import { DifferentiateExerciseForm } from './form/DifferentiateExerciseForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lessonPlansService } from '@/services/lesson-plans';
import { SavedContent } from '@/types/saved-content';
import { useToast } from "@/hooks/use-toast";

interface ExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    questionsPerExercise: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
    specificNeeds: string;
    challenges: string;
    originalExercise: string;
    studentProfile: string;
    learningDifficulties: string;
    lessonPlanId?: string;
    lessonPlanContent?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function ExerciseForm({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) {
  const [isDifferentiation, setIsDifferentiation] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<SavedContent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLessonPlans = async () => {
      try {
        const plans = await lessonPlansService.getAll();
        setLessonPlans(plans.map(plan => ({
          ...plan,
          type: 'lesson_plan' as const
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des séquences:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les séquences pédagogiques"
        });
      }
    };

    fetchLessonPlans();
  }, [toast]);

  const handleLessonPlanSelect = async (planId: string) => {
    const selectedPlan = lessonPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      // Nettoyer le contenu Markdown avant de l'afficher
      const cleanContent = selectedPlan.content
        .replace(/[*#]/g, '') // Supprime les astérisques et les dièses
        .replace(/\n{3,}/g, '\n\n') // Réduit les espaces multiples à deux sauts de ligne
        .trim();

      handleInputChange('lessonPlanId', planId);
      handleInputChange('subject', selectedPlan.subject || '');
      handleInputChange('classLevel', selectedPlan.class_level || '');
      handleInputChange('lessonPlanContent', cleanContent);
    }
  };

  const cleanAndFormatContent = (content: string) => {
    return content
      .replace(/[*#]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cleanContent = cleanAndFormatContent(e.target.value);
    handleInputChange('lessonPlanContent', cleanContent);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-center mb-8">
        <Tabs defaultValue={isDifferentiation ? "differentiate" : "generate"} className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="generate" 
              onClick={() => setIsDifferentiation(false)}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F97316] data-[state=active]:via-[#D946EF] data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Générer
            </TabsTrigger>
            <TabsTrigger 
              value="differentiate" 
              onClick={() => setIsDifferentiation(true)}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F97316] data-[state=active]:via-[#D946EF] data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Différencier
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {!isDifferentiation && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lessonPlan" className="block text-sm font-medium text-gray-700">
                Séquence pédagogique
              </label>
              <Select onValueChange={handleLessonPlanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une séquence existante" />
                </SelectTrigger>
                <SelectContent>
                  {lessonPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="lessonPlanContent" className="block text-sm font-medium text-gray-700">
                Ou collez le contenu d'une séquence
              </label>
              <Textarea
                id="lessonPlanContent"
                value={formData.lessonPlanContent}
                onChange={handleContentChange}
                placeholder="Collez ici le contenu de votre séquence..."
                className="min-h-[100px] whitespace-pre-line font-medium"
              />
            </div>
          </div>
        )}

        {isDifferentiation ? (
          <DifferentiateExerciseForm formData={formData} handleInputChange={handleInputChange} />
        ) : (
          <GenerateExerciseForm formData={formData} handleInputChange={handleInputChange} />
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isLoading 
          ? "Génération en cours..." 
          : isDifferentiation 
            ? "Différencier l'exercice"
            : formData.lessonPlanId || formData.lessonPlanContent
              ? "Générer un exercice à partir de la séquence"
              : "Générer les exercices"
        }
      </Button>
    </div>
  );
}
