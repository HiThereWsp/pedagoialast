import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  objective: string;
  exerciseType: string;
  instructions: string;
}

export function StandardExerciseGenerator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    subject: "",
    classLevel: "",
    numberOfExercises: "3",
    objective: "",
    exerciseType: "",
    instructions: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateExercises = async () => {
    if (!formData.classLevel.trim() || !formData.objective.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          type: 'standard'
        }
      });

      if (error) throw error;

      setGeneratedExercises(data.exercises);
      toast({
        title: "Exercices générés avec succès",
        description: "Vos exercices ont été créés",
      });
    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des exercices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100/20 to-white pt-24">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-blue-100/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/home')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Générateur d'exercices
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Créez des exercices adaptés à vos objectifs pédagogiques.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto flex flex-col items-center">
          <div className="w-full max-w-[800px] space-y-6 bg-white rounded-xl shadow-sm border border-blue-100/50 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière
              </label>
              <Input
                placeholder="Par exemple : Mathématiques, Français, Histoire..."
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de la classe <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Par exemple : 6ème, CM2, CE1"
                value={formData.classLevel}
                onChange={(e) => handleInputChange("classLevel", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'exercices
              </label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.numberOfExercises}
                onChange={(e) => handleInputChange("numberOfExercises", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif pédagogique <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Par exemple : Réviser les fractions, Pratiquer l'accord des adjectifs..."
                value={formData.objective}
                onChange={(e) => handleInputChange("objective", e.target.value)}
                className="min-h-[100px] w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'exercice
              </label>
              <Input
                placeholder="Par exemple : QCM, Questions ouvertes, Exercices pratiques..."
                value={formData.exerciseType}
                onChange={(e) => handleInputChange("exerciseType", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions supplémentaires
              </label>
              <Textarea
                placeholder="Précisez toutes les exigences supplémentaires pour vos exercices"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                className="min-h-[100px] w-full"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
              onClick={handleGenerateExercises}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isLoading ? "Génération en cours..." : "Générer les exercices"}
            </Button>
          </div>

          {generatedExercises && (
            <div className="w-full max-w-[800px] mt-8 bg-white rounded-xl shadow-sm border border-blue-100/50 p-6">
              <h2 className="text-xl font-semibold mb-4">Exercices générés</h2>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: generatedExercises }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}