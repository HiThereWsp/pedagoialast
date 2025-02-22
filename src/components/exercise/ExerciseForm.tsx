
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExerciseFormData } from "@/types/saved-content";

interface ExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ExerciseForm = ({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Matière</Label>
          <Input
            id="subject"
            placeholder="Ex: Mathématiques"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classLevel">Niveau de classe</Label>
          <Input
            id="classLevel"
            placeholder="Ex: 6ème"
            value={formData.classLevel}
            onChange={(e) => handleInputChange("classLevel", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfExercises">Nombre d'exercices</Label>
          <Input
            id="numberOfExercises"
            type="number"
            min="1"
            placeholder="Ex: 3"
            value={formData.numberOfExercises}
            onChange={(e) => handleInputChange("numberOfExercises", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionsPerExercise">Questions par exercice</Label>
          <Input
            id="questionsPerExercise"
            type="number"
            min="1"
            placeholder="Ex: 5"
            value={formData.questionsPerExercise}
            onChange={(e) => handleInputChange("questionsPerExercise", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exerciseType">Type d'exercice</Label>
          <Select
            value={formData.exerciseType}
            onValueChange={(value) => handleInputChange("exerciseType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="practice">Exercice d'entraînement</SelectItem>
              <SelectItem value="evaluation">Évaluation</SelectItem>
              <SelectItem value="review">Révision</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objective">Objectif pédagogique</Label>
        <Textarea
          id="objective"
          placeholder="Décrivez l'objectif pédagogique de ces exercices"
          value={formData.objective}
          onChange={(e) => handleInputChange("objective", e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInstructions">Instructions supplémentaires</Label>
        <Textarea
          id="additionalInstructions"
          placeholder="Ajoutez des instructions spécifiques si nécessaire"
          value={formData.additionalInstructions}
          onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificNeeds">Besoins spécifiques</Label>
        <Textarea
          id="specificNeeds"
          placeholder="Précisez les besoins particuliers des élèves"
          value={formData.specificNeeds}
          onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
        disabled={isLoading}
      >
        {isLoading ? "Génération en cours..." : "Générer les exercices"}
      </Button>
    </form>
  );
};

export default ExerciseForm;
