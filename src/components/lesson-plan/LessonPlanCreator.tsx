
import React, { useState, useEffect, useRef } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { useSavedContent } from "@/hooks/useSavedContent";
import { supabase } from "@/integrations/supabase/client";
import { SavedContent, HistoryItem } from "@/types/saved-content";
import { useIsMobile } from '@/hooks/use-mobile';
import { HistoryCarousel } from '@/components/history/HistoryCarousel';

export function LessonPlanCreator() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan, getSavedLessonPlans } = useSavedContent();
  const resultRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedContent[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedContent | null>(null);
  const [showForm, setShowForm] = useState(true);
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
      totalSessions: plan.total_sessions?.toString() || '',
      additionalInstructions: plan.additional_instructions || ''
    }));
  };

  const formatTitle = (title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  };

  const scrollToResult = () => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNewSequence = () => {
    setShowForm(true);
    setFormData({
      classLevel: '',
      additionalInstructions: '',
      totalSessions: '',
      subject: '',
      text: '',
      lessonPlan: ''
    });
    setSelectedPlan(null);
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

      const savedPlan = await saveLessonPlan({
        title: formatTitle(`${formData.subject || ''} - ${formData.classLevel}`.trim()),
        content: functionData.lessonPlan,
        subject: formData.subject,
        class_level: formData.classLevel,
        total_sessions: parseInt(formData.totalSessions),
        additional_instructions: formData.additionalInstructions
      });

      setSelectedPlan(savedPlan);
      await loadSavedPlans();
      await logToolUsage('lesson_plan', 'generate', functionData.lessonPlan.length, generationTime);
      setShowForm(false);
      scrollToResult();

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

  const transformSavedPlansToHistoryItems = (plans: SavedContent[]): HistoryItem[] => {
    return plans.map(plan => ({
      ...plan,
      tags: [{
        label: 'Séquence',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }));
  };

  useEffect(() => {
    loadSavedPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          {showForm ? (
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
                <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Wand2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Génération en cours...' : 'Générer la séquence'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerate()}
                className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Régénérer
              </Button>
              <Button
                onClick={handleNewSequence}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle séquence
              </Button>
            </div>
          )}
          
          <HistoryCarousel
            items={transformSavedPlansToHistoryItems(savedPlans)}
            onItemSelect={handleSelectPlan}
            selectedItemId={selectedPlan?.id}
          />
        </div>
        <div ref={resultRef} className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay 
            lessonPlan={formData.lessonPlan}
            lessonPlanId={selectedPlan?.id}
            subject={formData.subject}
            classLevel={formData.classLevel}
          />
        </div>
      </div>
    </div>
  );
}
