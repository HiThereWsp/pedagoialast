import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from '../constants';

interface LessonPlanFormProps {
  formData: {
    title: string;
    subject: string;
    classLevel: string;
    duration: string;
    objective: string;
    materials: string[];
    activities: Array<{ id: string; description: string; duration: string }>;
    assessment: string;
    differentiation: string;
    notes: string;
  };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onAddMaterial: () => void;
  onRemoveMaterial: (index: number) => void;
  onAddActivity: () => void;
  onRemoveActivity: (id: string) => void;
}

export const LessonPlanForm = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onAddMaterial,
  onRemoveMaterial,
  onAddActivity,
  onRemoveActivity
}: LessonPlanFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Titre
        </Label>
        <Input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="subject" className="text-right">
          Matière
        </Label>
        <Select value={formData.subject} onValueChange={(value) => onChange('subject', value)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Sélectionnez une matière" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((subj) => (
              <SelectItem key={subj} value={subj}>
                {subj}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="classLevel" className="text-right">
          Niveau
        </Label>
        <Input type="text" id="classLevel" value={formData.classLevel} onChange={(e) => onChange('classLevel', e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="duration" className="text-right">
          Durée
        </Label>
        <Input type="text" id="duration" value={formData.duration} onChange={(e) => onChange('duration', e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="objective" className="text-right">
          Objectif
        </Label>
        <Textarea id="objective" value={formData.objective} onChange={(e) => onChange('objective', e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right mt-2">
          Matériel
        </Label>
        <div className="col-span-3">
          {formData.materials.map((material, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                type="text"
                value={material}
                onChange={(e) => onChange(`materials[${index}]`, e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => onRemoveMaterial(index)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={onAddMaterial}>
            Ajouter du matériel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right mt-2">
          Activités
        </Label>
        <div className="col-span-3">
          {formData.activities.map((activity) => (
            <div key={activity.id} className="mb-4 p-4 border rounded-md">
              <div className="mb-2">
                <Label htmlFor={`description-${activity.id}`} className="block text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id={`description-${activity.id}`}
                  value={activity.description}
                  onChange={(e) => onChange(`activities[${formData.activities.findIndex(a => a.id === activity.id)}].description`, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor={`duration-${activity.id}`} className="block text-sm font-medium text-gray-700">Durée</Label>
                <Input
                  type="text"
                  id={`duration-${activity.id}`}
                  value={activity.duration}
                  onChange={(e) => onChange(`activities[${formData.activities.findIndex(a => a.id === activity.id)}].duration`, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => onRemoveActivity(activity.id)} className="mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={onAddActivity}>
            Ajouter une activité
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="assessment" className="text-right">
          Évaluation
        </Label>
        <Textarea id="assessment" value={formData.assessment} onChange={(e) => onChange('assessment', e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="differentiation" className="text-right">
          Différenciation
        </Label>
        <Textarea id="differentiation" value={formData.differentiation} onChange={(e) => onChange('differentiation', e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">
          Notes
        </Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => onChange('notes', e.target.value)} className="col-span-3" />
      </div>
      <Button type="submit" onClick={onSubmit} disabled={isLoading}>
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        ) : null}
        Créer
      </Button>
    </div>
  );
};
