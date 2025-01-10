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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    let streamedText = '';

    try {
      const response = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          classLevel: formData.classLevel,
          totalSessions: formData.totalSessions,
          subject: formData.subject,
          text: formData.text,
          additionalInstructions: formData.additionalInstructions,
        }
      });

      if (response.data) {
        const reader = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(JSON.stringify(response.data)));
            controller.close();
          }
        }).getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].delta.content;
                if (content) {
                  streamedText += content;
                  setFormData(prev => ({
                    ...prev,
                    lessonPlan: streamedText
                  }));
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('lesson_plan', 'generate', streamedText.length, generationTime);

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
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}