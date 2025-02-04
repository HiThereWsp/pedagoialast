import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

const Subject = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Matière <span className="text-red-500">*</span>
    </label>
    <Input
      placeholder="Par exemple : Mathématiques, Français..."
      value={value}
      onChange={(e) => onChange("subject", e.target.value)}
      className="w-full"
      required
    />
  </div>
);

const ClassLevel = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Niveau de la classe <span className="text-red-500">*</span>
    </label>
    <Input
      placeholder="Par exemple : 6ème, CM2..."
      value={value}
      onChange={(e) => onChange("classLevel", e.target.value)}
      className="w-full"
      required
    />
  </div>
);

const NumberOfExercises = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nombre d'exercices
    </label>
    <Input
      type="number"
      min="1"
      max="5"
      value={value}
      onChange={(e) => onChange("numberOfExercises", e.target.value)}
      className="w-full"
    />
  </div>
);

const Objective = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Objectif pédagogique <span className="text-red-500">*</span>
    </label>
    <Textarea
      placeholder="Quel est le but de cet exercice ?"
      value={value}
      onChange={(e) => onChange("objective", e.target.value)}
      className="min-h-[100px] w-full"
      required
    />
  </div>
);

const ExerciseType = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Type d'exercice
    </label>
    <Input
      placeholder="Par exemple : QCM, Questions ouvertes..."
      value={value}
      onChange={(e) => onChange("exerciseType", e.target.value)}
      className="w-full"
    />
  </div>
);

const AdditionalInstructions = ({ value, onChange }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Instructions supplémentaires
    </label>
    <Textarea
      placeholder="Précisez ce qui vous semble important comme les notions déjà traitées ou les notions spécifiques que vous souhaitez aborder..."
      value={value}
      onChange={(e) => onChange("additionalInstructions", e.target.value)}
      className="min-h-[100px] w-full"
    />
  </div>
);

export const FormFields = {
  Subject,
  ClassLevel,
  NumberOfExercises,
  Objective,
  ExerciseType,
  AdditionalInstructions,
};