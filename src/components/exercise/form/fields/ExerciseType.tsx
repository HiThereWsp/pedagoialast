
import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const ExerciseType = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Type d'exercice"
    placeholder="Par exemple : QCM, Questions ouvertes..."
    value={value}
    onChange={onChange}
    field="exerciseType"
  />
);
