
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface TextTabProps {
  formData: {
    text: string;
    subject_matter?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  showCommonFields?: boolean;
}

export function TextTab({ formData, handleInputChange }: TextTabProps) {
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
          Texte source <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Collez ici le texte que vous souhaitez utiliser comme base pour votre séquence..."
          value={formData.text}
          onChange={(e) => handleInputChange("text", e.target.value)}
          className="min-h-[200px] w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
        />
      </div>
    </div>
  );
}
