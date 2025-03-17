
import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const QuestionsPerExercise = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Nombre de questions par exercice"
    placeholder="Laissez vide pour un nombre adapté automatiquement"
    value={value}
    onChange={onChange}
    field="questionsPerExercise"
    type="number"
  />
);
