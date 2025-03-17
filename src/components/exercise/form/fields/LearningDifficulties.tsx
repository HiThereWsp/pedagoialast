
import React from 'react';
import { TextareaField } from './TextareaField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const LearningDifficulties = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Difficultés d'apprentissage"
    placeholder="Ex: dyslexie, TDAH, troubles de l'attention, etc."
    value={value}
    onChange={onChange}
    field="learningDifficulties"
  />
);
