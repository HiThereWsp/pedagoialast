
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommonFieldsProps {
  formData: {
    classLevel: string;
    additionalInstructions: string;
    totalSessions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function CommonFields({ formData, handleInputChange }: CommonFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Niveau de la classe <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Par exemple : 6ème, CM2, CE1"
          value={formData.classLevel}
          onChange={(e) => handleInputChange("classLevel", e.target.value)}
          className="w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de séances <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          min="1"
          required
          placeholder="Exemple : 5"
          value={formData.totalSessions}
          onChange={(e) => handleInputChange("totalSessions", e.target.value)}
          className="w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
        />
      </div>
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions supplémentaires (facultatif)
        </label>
        <Textarea
          placeholder="Précisez toutes les exigences supplémentaires pour votre plan de cours"
          value={formData.additionalInstructions}
          onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
          className="min-h-[100px] w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
        />
      </div>
    </div>
  );
}
