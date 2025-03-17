
import React from 'react';
import { TextareaField } from './TextareaField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const StudentProfile = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Profil ou niveau de l'élève"
    placeholder="Décrivez les caractéristiques de l'élève ou son niveau..."
    value={value}
    onChange={onChange}
    field="studentProfile"
    required
  />
);
