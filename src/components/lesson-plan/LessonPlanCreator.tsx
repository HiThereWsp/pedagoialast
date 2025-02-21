
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECTS } from './constants';
import { ResultDisplay } from './ResultDisplay';
import { useLessonPlanGeneration } from '@/hooks/useLessonPlanGeneration';
import { Loader2, Sparkles } from 'lucide-react';

export const LessonPlanCreator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    classLevel: '',
    objective: ''
  });

  const {
    generateLessonPlan,
    isGenerating,
    generatedContent,
    setGeneratedContent
  } = useLessonPlanGeneration();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateLessonPlan(formData);
  };

  if (generatedContent) {
    return (
      <ResultDisplay
        content={generatedContent}
        onReset={() => setGeneratedContent(null)}
        type="lesson-plan"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Matière</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une matière" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="classLevel">Niveau</Label>
          <Input
            id="classLevel"
            value={formData.classLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
            placeholder="Ex: 6ème, 5ème, 4ème..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objectifs d'apprentissage</Label>
          <Textarea
            id="objective"
            value={formData.objective}
            onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
            placeholder="Décrivez les objectifs d'apprentissage de votre séquence..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isGenerating || !formData.subject || !formData.classLevel || !formData.objective}
        className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Générer la séquence
          </>
        )}
      </Button>
    </form>
  );
};
