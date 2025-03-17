
import React from 'react';
import { Input } from "@/components/ui/input";

interface InputFieldProps { 
  label: string;
  placeholder: string;
  value: string;
  onChange: (field: string, value: string) => void;
  field: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
}

export const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  field, 
  required = false,
  type = "text",
  disabled = false
}: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full"
      required={required}
      disabled={disabled}
    />
  </div>
);
