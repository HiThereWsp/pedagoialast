import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonPlansService } from '@/services/lesson-plans';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSettings } from '@/hooks/useSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useProModal } from "@/hooks/use-pro-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubscription } from "@/hooks/use-subscription"
import { BackButton } from "@/components/settings/BackButton";
import { useNavigate } from 'react-router-dom';
import { SEO } from "@/components/SEO";

export const LessonPlanCreator = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [objective, setObjective] = useState('');
  const [materials, setMaterials] = useState(['']);
  const [activities, setActivities] = useState([{ id: uuidv4(), description: '', duration: '' }]);
  const [assessment, setAssessment] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { settings } = useSettings();
	const { subscription } = useSubscription();
  const proModal = useProModal();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['lesson-plans'],
    queryFn: lessonPlansService.getAll,
  });

  const { mutate: createLessonPlan, isLoading: isCreating } = useMutation(
    lessonPlansService.create,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lesson-plans']);
        toast({
          title: "Succès",
          description: "Le plan de leçon a été créé avec succès.",
        })
        setOpen(false);
        setTitle('');
        setSubject('');
        setClassLevel('');
        setDuration('');
        setObjective('');
        setMaterials(['']);
        setActivities([{ id: uuidv4(), description: '', duration: '' }]);
        setAssessment('');
        setDifferentiation('');
        setNotes('');
        navigate('/settings');
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la création du plan de leçon.",
        })
      }
    }
  );

  const handleAddMaterial = () => {
    setMaterials([...materials, '']);
  };

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    setMaterials(newMaterials);
  };

  const handleAddActivity = () => {
    setActivities([...activities, { id: uuidv4(), description: '', duration: '' }]);
  };

  const handleActivityChange = (id: string, field: string, value: string) => {
    const newActivities = activities.map(activity =>
      activity.id === id ? { ...activity, [field]: value } : activity
    );
    setActivities(newActivities);
  };

  const handleRemoveActivity = (id: string) => {
    const newActivities = activities.filter(activity => activity.id !== id);
    setActivities(newActivities);
  };

  const handleSubmit = () => {
		if (!subscription?.isPro && data && (data as any[]).length >= (settings?.free_lesson_plans_limit || 3)) {
      proModal.onOpen();
      return;
    }

    createLessonPlan({
      title,
      subject,
      class_level: classLevel,
      duration,
      objective,
      materials,
      activities,
      assessment,
      differentiation,
      notes
    });
  };

  const filteredPlans = data ? (data as any[]).filter(plan => {
    const searchTerm = title.toLowerCase();
    return plan.title.toLowerCase().includes(searchTerm);
  }) : [];

  return (
    <>
      <SEO
        title="Créateur de plans de leçon | PedagoIA"
        description="Créez des plans de leçon personnalisés et adaptés à vos besoins pédagogiques."
      />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="text-center mb-8">
          <img
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
            alt="PedagoIA Logo"
            className="w-[100px] h-[120px] object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Créateur de plans de leçon
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Créez facilement des plans de leçon adaptés à vos besoins et objectifs d'apprentissage.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow">
              Créer un plan de leçon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un plan de leçon</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire ci-dessous pour créer un nouveau plan de leçon.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Matière
                </Label>
                <Input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="classLevel" className="text-right">
                  Niveau
                </Label>
                <Input type="text" id="classLevel" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Durée
                </Label>
                <Input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="objective" className="text-right">
                  Objectif
                </Label>
                <Textarea id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">
                  Matériel
                </Label>
                <div className="col-span-3">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        type="text"
                        value={material}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveMaterial(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={handleAddMaterial}>
                    Ajouter du matériel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">
                  Activités
                </Label>
                <div className="col-span-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="mb-4 p-4 border rounded-md">
                      <div className="mb-2">
                        <Label htmlFor={`description-${activity.id}`} className="block text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          id={`description-${activity.id}`}
                          value={activity.description}
                          onChange={(e) => handleActivityChange(activity.id, 'description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`duration-${activity.id}`} className="block text-sm font-medium text-gray-700">Durée</Label>
                        <Input
                          type="text"
                          id={`duration-${activity.id}`}
                          value={activity.duration}
                          onChange={(e) => handleActivityChange(activity.id, 'duration', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveActivity(activity.id)} className="mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={handleAddActivity}>
                    Ajouter une activité
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assessment" className="text-right">
                  Évaluation
                </Label>
                <Textarea id="assessment" value={assessment} onChange={(e) => setAssessment(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="differentiation" className="text-right">
                  Différenciation
                </Label>
                <Textarea id="differentiation" value={differentiation} onChange={(e) => setDifferentiation(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <Button type="submit" onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : null}
              Créer
            </Button>
          </DialogContent>
        </Dialog>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Mes plans de leçon</h2>
          {data ? (
            <Table>
              <TableCaption>Vos plans de leçon créés.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Titre</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Niveau</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan: any) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.subject}</TableCell>
                    <TableCell>{plan.class_level}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
