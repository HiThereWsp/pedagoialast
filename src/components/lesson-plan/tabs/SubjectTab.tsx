import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface SubjectTabProps {
  formData: {
    subject: string;
  };
  handleInputChange: (field: string, value: string) => void;
  showCommonFields?: boolean;
}

export function SubjectTab({ formData, handleInputChange }: SubjectTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sujet ou thème à enseigner <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Par exemple : La photosynthèse, Les fractions, La Révolution française..."
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          className="min-h-[100px] w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
        />
      </div>
    </div>
  );
}