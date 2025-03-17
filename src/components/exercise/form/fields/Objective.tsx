
import React from 'react';
import { TextareaField } from './TextareaField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const Objective = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Objectif pédagogique"
    placeholder="Quel est l'objectif de votre séance ?"
    value={value}
    onChange={onChange}
    field="objective"
    required
  />
);
