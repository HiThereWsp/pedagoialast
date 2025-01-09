import React from 'react';
import { Input } from "@/components/ui/input";
import { CommonFields } from '../CommonFields';
import { Lock } from "lucide-react";

interface DocumentTabProps {
  formData: {
    classLevel: string;
    additionalInstructions: string;
    totalSessions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function DocumentTab({ formData, handleInputChange }: DocumentTabProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fonctionnalité Pro</h3>
          <p className="text-sm text-gray-500">
            Cette fonctionnalité est disponible uniquement avec un abonnement Pro.
          </p>
        </div>
      </div>
      <div className="space-y-6 opacity-50">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document <span className="text-red-500">*</span>
          </label>
          <Input
            type="file"
            disabled
            className="w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
          />
          <p className="mt-2 text-sm text-gray-500">
            Formats acceptés : PDF, DOCX, TXT (max 10MB)
          </p>
        </div>
        <CommonFields formData={formData} handleInputChange={handleInputChange} />
      </div>
    </div>
  );
}