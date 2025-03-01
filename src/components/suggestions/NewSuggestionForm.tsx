
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewSuggestionFormProps {
  newSuggestion: {
    title: string;
    description: string;
  };
  onCancel: () => void;
  onSubmit: () => void;
  onChange: (field: 'title' | 'description', value: string) => void;
}

export const NewSuggestionForm = ({
  newSuggestion,
  onCancel,
  onSubmit,
  onChange
}: NewSuggestionFormProps) => {
  return (
    <Card className="p-6 mb-4 bg-white shadow-sm rounded-lg">
      <div className="space-y-4">
        <Input
          placeholder="Titre de votre suggestion"
          value={newSuggestion.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="border rounded-lg focus:ring-1 focus:ring-[#FF9633] focus:border-[#FF9633]"
        />
        <textarea
          placeholder="Description détaillée de votre suggestion..."
          value={newSuggestion.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full p-4 border rounded-lg h-32 focus:outline-none focus:ring-1 focus:ring-[#FF9633] focus:border-[#FF9633] bg-white resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg"
          >
            Annuler
          </Button>
          <Button 
            onClick={onSubmit}
            className="bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-sm rounded-lg"
            disabled={!newSuggestion.title || !newSuggestion.description}
          >
            Publier la suggestion
          </Button>
        </div>
      </div>
    </Card>
  );
};
