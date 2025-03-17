
import React from 'react';
import { TextareaField } from './TextareaField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

export const AdditionalInstructions = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Instructions supplémentaires"
    placeholder="Précisez ce qui vous semble important comme les notions déjà traitées, les centres d'intérêt des élèves ou les notions spécifiques que vous souhaitez aborder..."
    value={value}
    onChange={onChange}
    field="additionalInstructions"
  />
);
