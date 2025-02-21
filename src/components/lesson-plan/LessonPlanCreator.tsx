
import React, { useState, useEffect } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { useSavedContent } from "@/hooks/useSavedContent";
import { supabase } from "@/integrations/supabase/client";
import { HistoryCarousel } from '@/components/history/HistoryCarousel';
import { SavedContent } from '@/types/saved-content';

export function LessonPlanCreator() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan, getSavedLessonPlans } = useSavedContent();
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedContent[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedContent | null>(null);
  const [formData, setFormData] = useState({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    text: '',
    lessonPlan: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadSavedPlans = async () => {
    try {
      const plans = await getSavedLessonPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const handleSelectPlan = (plan: SavedContent) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      lessonPlan: plan.content,
      classLevel: plan.class_level || '',
      subject: plan.subject || '',
      totalSessions: '', // Reset totalSessions as it's not in SavedContent type
      additionalInstructions: ''
    }));
  };

  const formatTitle = (title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  };

  const handleGenerate = async () => {
    if (!formData.classLevel || !formData.totalSessions) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          classLevel: formData.classLevel,
          totalSessions: formData.totalSessions,
          subject: formData.subject,
          text: formData.text,
          additionalInstructions: formData.additionalInstructions
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      
      setFormData(prev => ({
        ...prev,
        lessonPlan: functionData.lessonPlan
      }));

      await saveLessonPlan({
        title: formatTitle(`${formData.subject || ''} - ${formData.classLevel}`.trim()),
        content: functionData.lessonPlan,
        subject: formData.subject,
        class_level: formData.classLevel,
        total_sessions: parseInt(formData.totalSessions),
        additional_instructions: formData.additionalInstructions
      });

      await logToolUsage('lesson_plan', 'generate', functionData.lessonPlan.length, generationTime);
      await loadSavedPlans();

      toast({
        description: "Votre séquence a été générée et sauvegardée avec succès !"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération de la séquence."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const transformSavedPlansToHistoryItems = (plans: SavedContent[]): SavedContent[] => {
    return plans.map(plan => ({
      ...plan,
      id: plan.id,
      title: formatTitle(plan.title),
      content: plan.content,
      subject: plan.subject,
      created_at: plan.created_at,
      type: 'lesson-plan',
      tags: [{
        label: 'Séquence',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
            <Tabs defaultValue="subject" className="mb-6">
              <TabsList className="grid grid-cols-2 gap-4">
                <TabsTrigger value="subject">Programme scolaire</TabsTrigger>
                <TabsTrigger value="text">Texte</TabsTrigger>
              </TabsList>
              <TabsContent value="subject">
                <SubjectTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
              <TabsContent value="text">
                <TextTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
            </Tabs>
            <CommonFields formData={formData} handleInputChange={handleInputChange} />
            <div className="mt-8">
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                <Wand2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Génération en cours...' : 'Générer la séquence'}
              </Button>
            </div>
          </div>
          
          <HistoryCarousel
            items={transformSavedPlansToHistoryItems(savedPlans)}
            onItemSelect={handleSelectPlan}
            selectedItemId={selectedPlan?.id}
          />
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}
