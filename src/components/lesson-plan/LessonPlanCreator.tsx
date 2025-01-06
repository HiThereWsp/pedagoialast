import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload, Globe, FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function LessonPlanCreator() {
  const navigate = useNavigate();
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

    // Vérifier qu'au moins un champ source est rempli
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-gray-100"
          onClick={() => navigate('/chat')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Créer une séquence pédagogique</h1>
          <p className="text-gray-600">
            Créez vos séquences pédagogiques à partir de la source de votre choix
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="subject" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-gray-50 p-1 rounded-lg">
              <TabsTrigger value="subject" className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                </div>
                Sujet
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-3 w-3 text-purple-600" />
                </div>
                Texte
              </TabsTrigger>
              <TabsTrigger value="webpage" className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Globe className="h-3 w-3 text-green-600" />
                </div>
                Page web
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <Upload className="h-3 w-3 text-orange-600" />
                </div>
                Document
                <span className="ml-1 text-xs bg-yellow-400 text-black px-1.5 py-0.5 rounded">Pro</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="mt-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre sujet</label>
                    <Input
                      placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                    />
                  </div>
                  <CommonFields formData={formData} handleInputChange={handleInputChange} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="mt-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre texte</label>
                    <Textarea
                      placeholder="Collez votre texte ici..."
                      value={formData.text}
                      onChange={(e) => handleInputChange("text", e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                  <CommonFields formData={formData} handleInputChange={handleInputChange} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="webpage" className="mt-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lien de la page web</label>
                    <Input
                      placeholder="Collez l'URL de la page web"
                      value={formData.webUrl}
                      onChange={(e) => handleInputChange("webUrl", e.target.value)}
                    />
                  </div>
                  <CommonFields formData={formData} handleInputChange={handleInputChange} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="document" className="mt-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Cliquez pour joindre un document</p>
                      <p className="text-xs text-gray-400">Formats acceptés : PDF, DOC, DOCX</p>
                      <p className="text-xs text-yellow-600 mt-2">Fonctionnalité disponible avec l'abonnement Pro</p>
                    </div>
                  </div>
                  <CommonFields formData={formData} handleInputChange={handleInputChange} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full bg-[#9FD984] hover:bg-[#8BC572] text-black font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isLoading ? "Génération en cours..." : "Générer une séquence"}
          </Button>
        </div>

        {lessonPlan && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Séquence pédagogique générée</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{lessonPlan}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommonFieldsProps {
  formData: {
    classLevel: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

function CommonFields({ formData, handleInputChange }: CommonFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Niveau de la classe</label>
        <Input
          placeholder="Par exemple : 6ème, CM2, CE1"
          value={formData.classLevel}
          onChange={(e) => handleInputChange("classLevel", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Instructions supplémentaires (facultatif)
        </label>
        <Textarea
          placeholder="Précisez toutes les exigences supplémentaires pour votre plan de cours"
          value={formData.additionalInstructions}
          onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
}