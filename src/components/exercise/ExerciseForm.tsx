import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

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
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function ExerciseForm({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Générateur d'exercices</h1>
        <p className="text-gray-600">Créez des exercices personnalisés pour vos élèves</p>
      </div>

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
        {isLoading ? "Génération en cours..." : "Générer les exercices"}
      </Button>
    </div>
  );
}
