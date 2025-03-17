
import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const Subject = ({ value, onChange, disabled }: FieldProps) => (
  <InputField
    label="Matière"
    placeholder="Par exemple : Mathématiques, Français..."
    value={value}
    onChange={onChange}
    field="subject"
    required
    disabled={disabled}
  />
);
