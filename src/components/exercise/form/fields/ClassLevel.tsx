
import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const ClassLevel = ({ value, onChange, disabled }: FieldProps) => (
  <InputField
    label="Niveau de la classe"
    placeholder="Par exemple : 6ème, CM2..."
    value={value}
    onChange={onChange}
    field="classLevel"
    required
    disabled={disabled}
  />
);
