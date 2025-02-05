import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FieldProps {
  value: string;
  onChange: (field: string, value: string) => void;
}

// Base components
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  field, 
  required = false,
  type = "text" 
}: FieldProps & { 
  label: string, 
  placeholder: string, 
  field: string,
  required?: boolean,
  type?: string 
}) => (
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
    />
  </div>
);

const TextareaField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  field,
  required = false 
}: FieldProps & { 
  label: string, 
  placeholder: string, 
  field: string,
  required?: boolean 
}) => (
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

const QuestionsPerExercise = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Nombre de questions par exercice"
    placeholder="Laissez vide pour un nombre adapté automatiquement"
    value={value}
    onChange={onChange}
    field="questionsPerExercise"
    type="number"
  />
);

const LearningDifficulties = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Difficultés d'apprentissage"
    placeholder="Ex: dyslexie, TDAH, troubles de l'attention, etc."
    value={value}
    onChange={onChange}
    field="learningDifficulties"
  />
);

// Specific field components
const Subject = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Matière"
    placeholder="Par exemple : Mathématiques, Français..."
    value={value}
    onChange={onChange}
    field="subject"
    required
  />
);

const ClassLevel = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Niveau de la classe"
    placeholder="Par exemple : 6ème, CM2..."
    value={value}
    onChange={onChange}
    field="classLevel"
    required
  />
);

const NumberOfExercises = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Nombre d'exercices"
    placeholder=""
    value={value}
    onChange={onChange}
    field="numberOfExercises"
    type="number"
  />
);

const Objective = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Objectif pédagogique"
    placeholder="Quel est le but de cet exercice ?"
    value={value}
    onChange={onChange}
    field="objective"
    required
  />
);

const ExerciseType = ({ value, onChange }: FieldProps) => (
  <InputField
    label="Type d'exercice"
    placeholder="Par exemple : QCM, Questions ouvertes..."
    value={value}
    onChange={onChange}
    field="exerciseType"
  />
);

const AdditionalInstructions = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Instructions supplémentaires"
    placeholder="Précisez ce qui vous semble important comme les notions déjà traitées, les centres d'intérêt des élèves ou les notions spécifiques que vous souhaitez aborder..."
    value={value}
    onChange={onChange}
    field="additionalInstructions"
  />
);

// For differentiation form
const OriginalExercise = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Exercice original"
    placeholder="Collez ici l'exercice que vous souhaitez adapter..."
    value={value}
    onChange={onChange}
    field="originalExercise"
    required
  />
);

const StudentProfile = ({ value, onChange }: FieldProps) => (
  <TextareaField
    label="Profil ou niveau de l'élève"
    placeholder="Décrivez les caractéristiques de l'élève ou son niveau..."
    value={value}
    onChange={onChange}
    field="studentProfile"
    required
  />
);

export const FormFields = {
  Subject,
  ClassLevel,
  NumberOfExercises,
  QuestionsPerExercise,
  Objective,
  ExerciseType,
  AdditionalInstructions,
  OriginalExercise,
  StudentProfile,
  LearningDifficulties,
};