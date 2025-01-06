import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CorrespondenceFormProps {
  formData: {
    recipientType: string;
    subject: string;
    context: string;
    tone: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function CorrespondenceForm({ formData, handleInputChange, handleSubmit, isLoading }: CorrespondenceFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de destinataire <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.recipientType}
          onValueChange={(value) => handleInputChange("recipientType", value)}
        >
          <SelectTrigger className="w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors">
            <SelectValue placeholder="Choisissez le type de destinataire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parents">Parents d'élève</SelectItem>
            <SelectItem value="administration">Administration</SelectItem>
            <SelectItem value="colleagues">Collègues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sujet <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Ex: Absence, comportement, réunion..."
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          className="w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contexte <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Décrivez la situation ou le contexte de votre message..."
          value={formData.context}
          onChange={(e) => handleInputChange("context", e.target.value)}
          className="min-h-[100px] w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ton souhaité
        </label>
        <Select
          value={formData.tone}
          onValueChange={(value) => handleInputChange("tone", value)}
        >
          <SelectTrigger className="w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors">
            <SelectValue placeholder="Choisissez le ton du message" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="formal">Formel</SelectItem>
            <SelectItem value="semiformal">Semi-formel</SelectItem>
            <SelectItem value="friendly">Cordial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions supplémentaires (facultatif)
        </label>
        <Textarea
          placeholder="Ajoutez des détails ou des points spécifiques à inclure..."
          value={formData.additionalInstructions}
          onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
          className="min-h-[100px] w-full border-pink-200 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
        />
      </div>

      <Button
        className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isLoading ? "Génération en cours..." : "Générer la correspondance"}
      </Button>
    </div>
  );
}