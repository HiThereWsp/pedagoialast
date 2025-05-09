
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface SubjectTabProps {
  formData: {
    subject: string;
    subject_matter?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  showCommonFields?: boolean;
}

export function SubjectTab({ formData, handleInputChange }: SubjectTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Matière <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Par exemple : Mathématiques, Français, Histoire..."
          value={formData.subject_matter || ''}
          onChange={(e) => handleInputChange("subject_matter", e.target.value)}
          className="w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
        />
        <p className="text-xs text-gray-500 mt-1">
          Spécifiez la discipline scolaire exacte pour éviter toute ambiguïté
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objectifs d'apprentissage <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Par exemple : Maîtriser les fractions, Comprendre les causes de la Révolution française..."
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          className="min-h-[100px] w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
        />
        <p className="text-xs text-gray-500 mt-1">
          Définissez précisément ce que les élèves doivent apprendre durant cette séquence
        </p>
      </div>
    </div>
  );
}
