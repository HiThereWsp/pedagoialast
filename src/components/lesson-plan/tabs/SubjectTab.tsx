
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubjectTabProps {
  formData: {
    subject: string;
    subject_matter?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  showCommonFields?: boolean;
}

export function SubjectTab({ formData, handleInputChange }: SubjectTabProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programme <span className="text-red-500">*</span>
              </label>
            </TooltipTrigger>
            <TooltipContent>
              <p>Créer une séquence à partir de votre programmation en cours ou à partir d'un texte source</p>
            </TooltipContent>
          </Tooltip>
          <Input
            placeholder="Par exemple : Mathématiques, Français, Histoire..."
            value={formData.subject_matter || ''}
            onChange={(e) => handleInputChange("subject_matter", e.target.value)}
            className="w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sujet ou thème à enseigner <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Par exemple : La photosynthèse, Les fractions, La Révolution française..."
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            className="min-h-[100px] w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
