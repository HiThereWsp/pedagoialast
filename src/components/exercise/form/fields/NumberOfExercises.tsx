
import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const NumberOfExercises = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Nombre d'exercices"
    placeholder=""
    value={value}
    onChange={onChange}
    field="numberOfExercises"
    type="number"
  />
);
