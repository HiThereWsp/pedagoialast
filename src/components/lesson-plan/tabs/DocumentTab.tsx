import React from 'react';
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { CommonFields } from '../CommonFields';

interface DocumentTabProps {
  formData: {
    classLevel: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function DocumentTab({ formData, handleInputChange }: DocumentTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Cliquez pour joindre un document</p>
            <p className="text-xs text-gray-400">Formats acceptés : PDF, DOC, DOCX</p>
            <p className="text-xs text-yellow-600 mt-2">Fonctionnalité disponible avec l'abonnement Pro</p>
          </div>
        </div>
        <CommonFields formData={formData} handleInputChange={handleInputChange} />
      </div>
    </Card>
  );
}