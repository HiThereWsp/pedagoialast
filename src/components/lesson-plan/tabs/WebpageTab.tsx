import React from 'react';
import { Input } from "@/components/ui/input";
import { CommonFields } from '../CommonFields';

interface WebpageTabProps {
  formData: {
    webUrl: string;
    classLevel: string;
    additionalInstructions: string;
    totalSessions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function WebpageTab({ formData, handleInputChange }: WebpageTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de la page web <span className="text-red-500">*</span>
        </label>
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={formData.webUrl}
          onChange={(e) => handleInputChange("webUrl", e.target.value)}
          className="w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
        />
      </div>
      <CommonFields formData={formData} handleInputChange={handleInputChange} />
    </div>
  );
}