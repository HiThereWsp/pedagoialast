import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre court et descriptif
        </label>
        <Input
          id="title"
          placeholder="Titre de votre suggestion"
          value={newSuggestion.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Description détaillée de votre suggestion..."
          value={newSuggestion.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 h-32 resize-none"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          variant="outline"
          onClick={onCancel}
          className="text-gray-700"
        >
          Annuler
        </Button>
        <Button 
          onClick={onSubmit}
          className="bg-gray-900 hover:bg-gray-800 text-white"
          disabled={!newSuggestion.title || !newSuggestion.description}
        >
          Soumettre la suggestion
        </Button>
      </div>
    </div>
  );
};
