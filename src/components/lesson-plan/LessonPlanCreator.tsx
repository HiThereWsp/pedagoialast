
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
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
          
          <div className="relative bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Historique</h3>
            </div>
            
            {savedPlans.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: savedPlans.length > 3,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {savedPlans.map((plan) => (
                    <CarouselItem key={plan.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <Card 
                        className={`h-[280px] p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          selectedPlan?.id === plan.id ? 'border-primary' : ''
                        }`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        <div className="h-full flex flex-col">
                          <h3 className="font-semibold mb-2 line-clamp-2">{formatTitle(plan.title)}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="shrink-0">{getRelativeDate(plan.created_at)}</span>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                              <span className="shrink-0 px-2 py-1 bg-[#FF9EBC]/20 text-[#FF9EBC] rounded-full text-xs border border-[#FF9EBC]/30">
                                Séquence
                              </span>
                              {plan.subject && (
                                <span className="shrink-0 px-2 py-1 bg-primary/10 rounded-full text-xs">
                                  {plan.subject}
                                </span>
                              )}
                            </div>
                          </div>
                          <div 
                            className="text-sm line-clamp-6 prose prose-sm max-w-none flex-grow overflow-y-auto"
                            dangerouslySetInnerHTML={{ 
                              __html: formatPreviewContent(plan.content)
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }}
                          />
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {savedPlans.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <p className="text-center text-muted-foreground">
                Aucune séquence sauvegardée
              </p>
            )}
          </div>
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}
