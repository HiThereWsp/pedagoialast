
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps { 
  label: string;
  placeholder: string;
  value: string;
  onChange: (field: string, value: string) => void;
  field: string;
  required?: boolean;
}

export const TextareaField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  field,
  required = false 
}: TextareaFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="min-h-[100px] w-full"
      required={required}
    />
  </div>
);
