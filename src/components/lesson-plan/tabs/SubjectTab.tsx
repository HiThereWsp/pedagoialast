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
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Votre sujet</label>
          <Input
            placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
          />
        </div>
        <CommonFields formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Card>
  );
}