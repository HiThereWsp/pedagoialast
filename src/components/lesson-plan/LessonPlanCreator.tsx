import React, { useState } from 'react';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';

export function LessonPlanCreator() {
  const [formData, setFormData] = useState({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    text: '',
    lessonPlan: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
            <Tabs defaultValue="subject" className="mb-6">
              <TabsList className="grid grid-cols-2 gap-4">
                <TabsTrigger value="subject">Programme scolaire</TabsTrigger>
                <TabsTrigger value="text">Texte</TabsTrigger>
              </TabsList>
              <TabsContent value="subject">
                <SubjectTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
              <TabsContent value="text">
                <TextTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
            </Tabs>
            <CommonFields formData={formData} handleInputChange={handleInputChange} />
          </div>
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}