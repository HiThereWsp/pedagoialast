import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
    specificNeeds: string;
    strengths: string;
    challenges: string;
    originalExercise: string;
    studentProfile: string;
    learningStyle: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function ExerciseForm({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) {
  const [isDifferentiation, setIsDifferentiation] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isDifferentiation ? "Différenciation d'exercice" : "Générateur d'exercices"}
            </h1>
            <p className="text-gray-600">
              {isDifferentiation 
                ? "Adaptez un exercice existant aux besoins spécifiques d'un élève" 
                : "Créez des exercices personnalisés pour vos élèves"}
            </p>
          </div>
          <Tabs defaultValue={isDifferentiation ? "differentiate" : "generate"} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="generate" 
                onClick={() => setIsDifferentiation(false)}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9b87f5] data-[state=active]:to-[#6E59A5] data-[state=active]:text-white"
              >
                Générer
              </TabsTrigger>
              <TabsTrigger 
                value="differentiate" 
                onClick={() => setIsDifferentiation(true)}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9b87f5] data-[state=active]:to-[#6E59A5] data-[state=active]:text-white"
              >
                Différencier
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isDifferentiation ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercice original <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Collez ici l'exercice que vous souhaitez adapter..."
              value={formData.originalExercise}
              onChange={(e) => handleInputChange("originalExercise", e.target.value)}
              className="min-h-[150px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matière <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Par exemple : Mathématiques, Français..."
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de la classe <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Par exemple : 6ème, CM2..."
              value={formData.classLevel}
              onChange={(e) => handleInputChange("classLevel", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif pédagogique <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Quel est le but de cet exercice ?"
              value={formData.objective}
              onChange={(e) => handleInputChange("objective", e.target.value)}
              className="min-h-[100px] w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profil ou niveau de l'élève <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Décrivez les caractéristiques de l'élève ou son niveau..."
              value={formData.studentProfile}
              onChange={(e) => handleInputChange("studentProfile", e.target.value)}
              className="min-h-[100px] w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style d'apprentissage
            </label>
            <Select
              value={formData.learningStyle}
              onValueChange={(value) => handleInputChange("learningStyle", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisissez un style d'apprentissage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visuel</SelectItem>
                <SelectItem value="auditory">Auditif</SelectItem>
                <SelectItem value="kinesthetic">Kinesthésique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Besoins spécifiques
            </label>
            <Textarea
              placeholder="Par exemple : dyslexie, TDAH..."
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
              className="min-h-[100px] w-full"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matière <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Par exemple : Mathématiques, Français, Histoire..."
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
              required
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
              className="w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
              required
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
              className="w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
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
              className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
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
              className="w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Besoins spécifiques
            </label>
            <Textarea
              placeholder="Par exemple : Dyslexie, TDAH, Troubles visuels..."
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
              className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forces ou intérêts
            </label>
            <Textarea
              placeholder="Par exemple : Facilité avec les images, Intérêt pour la musique..."
              value={formData.strengths}
              onChange={(e) => handleInputChange("strengths", e.target.value)}
              className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Défis ou obstacles
            </label>
            <Textarea
              placeholder="Par exemple : Difficulté de concentration, Anxiété face aux exercices..."
              value={formData.challenges}
              onChange={(e) => handleInputChange("challenges", e.target.value)}
              className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions supplémentaires
            </label>
            <Textarea
              placeholder="Précisez toutes les exigences supplémentaires pour vos exercices"
              value={formData.additionalInstructions}
              onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
              className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
        </>
      )}

      <Button
        className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isLoading 
          ? "Génération en cours..." 
          : isDifferentiation 
            ? "Différencier l'exercice"
            : "Générer les exercices"
        }
      </Button>
    </div>
  );
}