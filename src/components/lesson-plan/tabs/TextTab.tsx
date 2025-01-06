import React from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CommonFields } from '../CommonFields';

interface TextTabProps {
  formData: {
    text: string;
    classLevel: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function TextTab({ formData, handleInputChange }: TextTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Votre texte</label>
          <Textarea
            placeholder="Collez votre texte ici..."
            value={formData.text}
            onChange={(e) => handleInputChange("text", e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <CommonFields formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Card>
  );
}