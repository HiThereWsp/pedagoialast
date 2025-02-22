import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { CommonFields } from './CommonFields';
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
interface LessonPlanFormProps {
  formData: {
    classLevel: string;
    additionalInstructions: string;
    totalSessions: string;
    subject: string;
    text: string;
  };
  isLoading: boolean;
  onInputChange: (field: string, value: string) => void;
  onGenerate: () => void;
}
export const LessonPlanForm = memo(function LessonPlanForm({
  formData,
  isLoading,
  onInputChange,
  onGenerate
}: LessonPlanFormProps) {
  return <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
      <Tabs defaultValue="subject" className="mb-6">
        <TabsList className="grid grid-cols-2 gap-4">
          <TabsTrigger value="subject">Votre programme</TabsTrigger>
          <TabsTrigger value="text">Texte</TabsTrigger>
        </TabsList>
        <TabsContent value="subject">
          <SubjectTab formData={formData} handleInputChange={onInputChange} showCommonFields={false} />
        </TabsContent>
        <TabsContent value="text">
          <TextTab formData={formData} handleInputChange={onInputChange} showCommonFields={false} />
        </TabsContent>
      </Tabs>
      <CommonFields formData={formData} handleInputChange={onInputChange} />
      <div className="mt-8">
        <Button onClick={onGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
          <Wand2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Génération en cours...' : 'Générer la séquence'}
        </Button>
      </div>
    </div>;
});