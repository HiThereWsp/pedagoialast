import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, FileText, Sparkles, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from './Header';
import { SubjectTab } from './tabs/SubjectTab';
import { TextTab } from './tabs/TextTab';
import { WebpageTab } from './tabs/WebpageTab';
import { DocumentTab } from './tabs/DocumentTab';
import { ResultDisplay } from './ResultDisplay';

export function LessonPlanCreator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subject");
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    webUrl: "",
    text: "",
    classLevel: "",
    additionalInstructions: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.classLevel) {
      toast({
        title: "Niveau requis",
        description: "Veuillez spécifier le niveau de la classe",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject && !formData.webUrl && !formData.text) {
      toast({
        title: "Source requise",
        description: "Veuillez fournir au moins un sujet, une URL ou un texte",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: formData
      });

      if (error) throw error;

      setLessonPlan(data.lessonPlan);
      toast({
        title: "Séquence générée avec succès",
        description: "Votre séquence pédagogique a été créée",
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la séquence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Tabs defaultValue="subject" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-gray-50/50 p-1 rounded-lg mb-6">
                  <TabsTrigger value="subject" className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-[#9b87f5]" />
                    </div>
                    <span className="hidden sm:inline">Sujet</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <span className="hidden sm:inline">Texte</span>
                  </TabsTrigger>
                  <TabsTrigger value="webpage" className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="hidden sm:inline">Page web</span>
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <Upload className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <span className="hidden sm:inline">Document</span>
                    <span className="ml-1 text-xs bg-yellow-400 text-black px-1.5 py-0.5 rounded">Pro</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subject" className="mt-6 focus:outline-none">
                  <SubjectTab formData={formData} handleInputChange={handleInputChange} />
                </TabsContent>

                <TabsContent value="text" className="mt-6 focus:outline-none">
                  <TextTab formData={formData} handleInputChange={handleInputChange} />
                </TabsContent>

                <TabsContent value="webpage" className="mt-6 focus:outline-none">
                  <WebpageTab formData={formData} handleInputChange={handleInputChange} />
                </TabsContent>

                <TabsContent value="document" className="mt-6 focus:outline-none">
                  <DocumentTab formData={formData} handleInputChange={handleInputChange} />
                </TabsContent>
              </Tabs>

              <Button
                className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 mt-6 transition-colors duration-200"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {isLoading ? "Génération en cours..." : "Générer une séquence"}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 space-y-6">
            <ResultDisplay lessonPlan={lessonPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}