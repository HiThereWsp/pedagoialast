
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
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Programme <span className="text-red-500">*</span>
                </label>
                <div className="text-gray-400 hover:text-gray-600">ℹ️</div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Créer une séquence à partir de votre programmation en cours ou à partir d'un texte source</p>
            </TooltipContent>
          </Tooltip>
          <Input
            placeholder="Par exemple : Mathématiques, Français, Histoire..."
            value={formData.subject_matter || ''}
            onChange={(e) => handleInputChange("subject_matter", e.target.value)}
            className="w-full mt-2 border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
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
