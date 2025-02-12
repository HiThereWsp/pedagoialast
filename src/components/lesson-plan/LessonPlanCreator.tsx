
import React, { useState, useEffect } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2, History } from "lucide-react";
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

export function LessonPlanCreator() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan, getSavedLessonPlans } = useSavedContent();
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
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
        title: `Séquence ${formData.subject || ''} - ${formData.classLevel}`,
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
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Historique des séquences</SheetTitle>
                  <SheetDescription>
                    Vos dernières séquences générées
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {savedPlans.map((plan) => (
                    <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2">{plan.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(plan.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm line-clamp-3">{plan.content}</p>
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
