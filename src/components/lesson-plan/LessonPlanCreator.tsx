import React, { useState, useEffect } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2, History, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { useSavedContent } from "@/hooks/useSavedContent";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export function LessonPlanCreator() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan, getSavedLessonPlans } = useSavedContent();
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
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

  const handleSelectPlan = (plan: any) => {
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

  const handleGenerate = async () => {
    if (!formData.classLevel || !formData.totalSessions) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
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
          additionalInstructions: formData.additionalInstructions,
        }
      });

      if (functionError) {
        throw functionError;
      }

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
      await loadSavedPlans(); // Recharger l'historique après la génération

      toast({
        description: "Votre séquence a été générée et sauvegardée avec succès !",
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération de la séquence.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const getRelativeDate = (date: string) => {
    return formatDistanceToNowStrict(new Date(date), { 
      addSuffix: true,
      locale: fr 
    }).replace('dans ', 'il y a ');
  };

  const formatPreviewContent = (content: string) => {
    const cleanContent = content
      .replace(/^Séquence pédagogique[\s-]*/i, '')
      .replace(/^###\s*/gm, '')
      .replace(/^\s*\*\*/gm, '')
      .replace(/\*\*\s*$/gm, '')
      .trim();
    return cleanContent;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200 flex-grow mr-2">
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
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historique
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={isMobile ? "bottom" : "right"} 
                className={isMobile ? "h-[80vh]" : "w-[500px] sm:w-[540px]"}
              >
                <SheetHeader>
                  <SheetTitle>Historique des séquences</SheetTitle>
                  <SheetDescription>
                    Vos dernières séquences générées
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {savedPlans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedPlan?.id === plan.id ? 'border-primary' : ''
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{formatTitle(plan.title)}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 overflow-x-auto no-scrollbar">
                            <span className="shrink-0">{getRelativeDate(plan.created_at)}</span>
                            <span className="shrink-0 px-2 py-1 bg-[#FF9EBC]/20 text-[#FF9EBC] rounded-full text-xs border border-[#FF9EBC]/30">
                              Séquence
                            </span>
                            {plan.subject && (
                              <span className="shrink-0 px-2 py-1 bg-primary/10 rounded-full text-xs">
                                {plan.subject}
                              </span>
                            )}
                          </div>
                          <div 
                            className="text-sm line-clamp-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: formatPreviewContent(plan.content)
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }}
                          />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                  {savedPlans.length === 0 && (
                    <p className="text-center text-muted-foreground">
                      Aucune séquence sauvegardée
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}
