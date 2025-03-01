
import React, { useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Wand2 } from "lucide-react";
import type { ExerciseFormData } from "@/types/saved-content";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LessonPlanSelect } from '../form/LessonPlanSelect';

interface DifferentiateExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const DifferentiateExerciseForm: React.FC<DifferentiateExerciseFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  isLoading
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll to form when mounting
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="relative z-10 max-w-4xl mx-auto space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      <div className="space-y-6">
        <LessonPlanSelect 
          value={formData.selectedLessonPlan || ''} 
          onChange={handleInputChange}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-700">Matière</Label>
            <Input
              id="subject"
              placeholder="Ex: Mathématiques"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classLevel" className="text-gray-700">Niveau de classe</Label>
            <Input
              id="classLevel"
              placeholder="Ex: 6ème"
              value={formData.classLevel}
              onChange={(e) => handleInputChange("classLevel", e.target.value)}
              required
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalExercise" className="text-gray-700">Exercice original à différencier</Label>
            <Textarea
              id="originalExercise"
              placeholder="Copiez ici l'exercice que vous souhaitez différencier..."
              value={formData.originalExercise}
              onChange={(e) => handleInputChange("originalExercise", e.target.value)}
              className="min-h-[150px] w-full transition-colors focus:border-pink-300"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentProfile" className="text-gray-700">Profil de l'élève</Label>
            <Textarea
              id="studentProfile"
              placeholder="Décrivez l'élève pour qui vous différenciez cet exercice..."
              value={formData.studentProfile}
              onChange={(e) => handleInputChange("studentProfile", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningDifficulties" className="text-gray-700">Difficultés d'apprentissage</Label>
            <Textarea
              id="learningDifficulties"
              placeholder="Précisez les difficultés rencontrées par l'élève..."
              value={formData.learningDifficulties}
              onChange={(e) => handleInputChange("learningDifficulties", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-gray-700">Défis à relever</Label>
            <Select
              value={formData.challenges || ""}
              onValueChange={(value) => handleInputChange("challenges", value)}
            >
              <SelectTrigger className="w-full transition-colors focus:border-pink-300">
                <SelectValue placeholder="Sélectionner un niveau de défi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simplified">Simplification majeure</SelectItem>
                <SelectItem value="accessible">Rendre plus accessible</SelectItem>
                <SelectItem value="alternative">Approche alternative</SelectItem>
                <SelectItem value="enriched">Enrichissement pour élève avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <LoadingIndicator />
              <span>Différenciation en cours...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              <span>Différencier cet exercice</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default DifferentiateExerciseForm;
