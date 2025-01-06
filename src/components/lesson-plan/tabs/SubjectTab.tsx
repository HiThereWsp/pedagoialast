import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommonFields } from '../CommonFields';

interface SubjectTabProps {
  formData: {
    subject: string;
    classLevel: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function SubjectTab({ formData, handleInputChange }: SubjectTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Votre sujet</label>
        <Input
          placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          className="w-full border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
        />
      </div>
      <CommonFields formData={formData} handleInputChange={handleInputChange} />
    </div>
  );
}