import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommonFields } from '../CommonFields';

interface WebpageTabProps {
  formData: {
    webUrl: string;
    classLevel: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function WebpageTab({ formData, handleInputChange }: WebpageTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lien de la page web</label>
          <Input
            placeholder="Collez l'URL de la page web"
            value={formData.webUrl}
            onChange={(e) => handleInputChange("webUrl", e.target.value)}
          />
        </div>
        <CommonFields formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Card>
  );
}