import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface TextTabProps {
  formData: {
    text: string;
  };
  handleInputChange: (field: string, value: string) => void;
  showCommonFields?: boolean;
}

export function TextTab({ formData, handleInputChange }: TextTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte source <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Collez ici le texte que vous souhaitez utiliser comme base pour votre séquence..."
          value={formData.text}
          onChange={(e) => handleInputChange("text", e.target.value)}
          className="min-h-[200px] w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
        />
      </div>
    </div>
  );
}