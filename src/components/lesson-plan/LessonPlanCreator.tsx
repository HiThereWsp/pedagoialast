
import React, { useState } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LessonPlanCreator() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    text: '',
    lessonPlan: ''
  });
  const [streamedContent, setStreamedContent] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processStream = async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let content = '';

    if (!reader) {
      throw new Error('No reader available');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        content += chunk;
        setStreamedContent(content);
      }
    } finally {
      reader.releaseLock();
    }

    return content;
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
    setStreamedContent('');
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

      let finalContent;
      if (functionData.cached) {
        // Si c'est en cache, on l'affiche directement
        finalContent = functionData.lessonPlan;
        setStreamedContent(finalContent);
        toast({
          description: "Séquence récupérée du cache !",
        });
      } else {
        // Sinon on traite le stream
        finalContent = await processStream(functionData);
      }

      const generationTime = Math.round(performance.now() - startTime);
      
      setFormData(prev => ({
        ...prev,
        lessonPlan: finalContent
      }));

      await logToolUsage('lesson_plan', 'generate', finalContent.length, generationTime);

      toast({
        description: "Votre séquence a été générée avec succès !",
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

  const LoadingSkeleton = () => (
    <Card className="p-6 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
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
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          {isLoading && !streamedContent ? (
            <LoadingSkeleton />
          ) : (
            <ResultDisplay lessonPlan={streamedContent || formData.lessonPlan} />
          )}
        </div>
      </div>
    </div>
  );
}
