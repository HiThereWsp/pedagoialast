import React, { useState } from 'react';
import { Header } from './Header';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentTab } from './tabs/DocumentTab';
import { TextTab } from './tabs/TextTab';
import { WebpageTab } from './tabs/WebpageTab';
import { SubjectTab } from './tabs/SubjectTab';

export function LessonPlanCreator() {
  const [formData, setFormData] = useState({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    text: '',
    webUrl: '',
    lessonPlan: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-purple-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto flex flex-col items-center">
          <div className="w-full max-w-[1200px]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <CommonFields formData={formData} handleInputChange={handleInputChange} />
                  <Tabs defaultValue="subject" className="mt-6">
                    <TabsList className="grid grid-cols-4 gap-4">
                      <TabsTrigger value="subject">Matière</TabsTrigger>
                      <TabsTrigger value="document">Document</TabsTrigger>
                      <TabsTrigger value="text">Texte</TabsTrigger>
                      <TabsTrigger value="webpage">Page web</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subject">
                      <SubjectTab formData={formData} handleInputChange={handleInputChange} />
                    </TabsContent>
                    <TabsContent value="document">
                      <DocumentTab formData={formData} handleInputChange={handleInputChange} />
                    </TabsContent>
                    <TabsContent value="text">
                      <TextTab formData={formData} handleInputChange={handleInputChange} />
                    </TabsContent>
                    <TabsContent value="webpage">
                      <WebpageTab formData={formData} handleInputChange={handleInputChange} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <div className="xl:sticky xl:top-8 space-y-6">
                <ResultDisplay lessonPlan={formData.lessonPlan} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}