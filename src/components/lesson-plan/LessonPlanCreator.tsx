
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonPlansService } from '@/services/lesson-plans';
import { useNavigate } from 'react-router-dom';
import { SEO } from "@/components/SEO";
import { BackButton } from "@/components/settings/BackButton";
import { Header } from './components/Header';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanTable } from './components/LessonPlanTable';

export const LessonPlanCreator = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    classLevel: '',
    duration: '',
    objective: '',
    materials: [''],
    activities: [{ id: uuidv4(), description: '', duration: '' }],
    assessment: '',
    differentiation: '',
    notes: ''
  });
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ['lesson-plans'],
    queryFn: lessonPlansService.getAll,
  });

  const { mutate: createLessonPlan, isLoading: isCreating } = useMutation({
    mutationFn: lessonPlansService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast({
        title: "Succès",
        description: "Le plan de leçon a été créé avec succès.",
      });
      setOpen(false);
      setFormData({
        title: '',
        subject: '',
        classLevel: '',
        duration: '',
        objective: '',
        materials: [''],
        activities: [{ id: uuidv4(), description: '', duration: '' }],
        assessment: '',
        differentiation: '',
        notes: ''
      });
      navigate('/settings');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du plan de leçon.",
      });
    }
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials.splice(index, 1);
      return { ...prev, materials: newMaterials };
    });
  };

  const handleAddActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { id: uuidv4(), description: '', duration: '' }]
    }));
  };

  const handleRemoveActivity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }));
  };

  const handleSubmit = () => {
    createLessonPlan({
      title: formData.title,
      subject: formData.subject,
      class_level: formData.classLevel,
      duration: formData.duration,
      objective: formData.objective,
      materials: formData.materials,
      activities: formData.activities,
      assessment: formData.assessment,
      differentiation: formData.differentiation,
      notes: formData.notes
    });
  };

  return (
    <>
      <SEO
        title="Créateur de plans de leçon | PedagoIA"
        description="Créez des plans de leçon personnalisés et adaptés à vos besoins pédagogiques."
      />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <Header />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow">
              Créer un plan de leçon
            </Button>
          </DialogTrigger>
          <DialogContent className="max

-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un plan de leçon</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire ci-dessous pour créer un nouveau plan de leçon.
              </DialogDescription>
            </DialogHeader>
            <LessonPlanForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isLoading={isCreating}
              onAddMaterial={handleAddMaterial}
              onRemoveMaterial={handleRemoveMaterial}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
            />
          </DialogContent>
        </Dialog>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Mes plans de leçon</h2>
          <LessonPlanTable data={data} isLoading={isLoadingData} />
        </div>
      </div>
    </>
  );
};
