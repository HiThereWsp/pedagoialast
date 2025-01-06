import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { CorrespondenceForm } from './CorrespondenceForm';
import { ResultDisplay } from './ResultDisplay';

export function CorrespondenceGenerator() {
  const [correspondence, setCorrespondence] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: '',
    subject: '',
    context: '',
    tone: '',
    additionalInstructions: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://jpelncawdaounkidvymu.supabase.co/functions/v1/generate-correspondence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la correspondance');
      }

      const data = await response.json();
      setCorrespondence(data.correspondence);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="p-6 bg-white rounded-xl border border-orange-100">
          <CorrespondenceForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Card>
        {correspondence && (
          <ResultDisplay correspondence={correspondence} />
        )}
      </div>
    </div>
  );
}