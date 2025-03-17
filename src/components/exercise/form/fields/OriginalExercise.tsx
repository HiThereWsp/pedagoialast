
import React from 'react';
import { TextareaField } from './TextareaField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const OriginalExercise = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Exercice original"
    placeholder="Collez ici l'exercice que vous souhaitez adapter..."
    value={value}
    onChange={onChange}
    field="originalExercise"
    required
  />
);
