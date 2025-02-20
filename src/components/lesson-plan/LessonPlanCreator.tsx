
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { generateLessonPlan, getLessonPlans, type LessonPlanData } from '@/lib/lesson-plan';
import { CommonFields } from './CommonFields';
import { ResultDisplay } from './ResultDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTab } from './tabs/TextTab';
import { SubjectTab } from './tabs/SubjectTab';
import { Button } from "@/components/ui/button";
import { Wand2, History, ChevronRight } from "lucide-react";
import { useToolMetrics } from "@/hooks/useToolMetrics";
import { useSavedContent } from "@/hooks/useSavedContent";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HistoryCarousel } from '@/components/history/HistoryCarousel';

interface LessonPlan {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: Array<{
    label: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }>;
}

export function LessonPlanCreator() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [learningObjectives, setLearningObjectives] = useState(['']);
  const [materials, setMaterials] = useState(['']);
  const [activities, setActivities] = useState(['']);
  const [assessment, setAssessment] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [notes, setNotes] = useState('');
  const [searchParams] = useSearchParams();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from") as string) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to") as string) : undefined,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    logToolUsage
  } = useToolMetrics();
  const {
    saveLessonPlan,
    getSavedLessonPlans
  } = useSavedContent();
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [formData, setFormData] = useState({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    text: '',
    lessonPlan: ''
  });

  const { data: lessonPlans, refetch } = useQuery({
    queryKey: ['lessonPlans', user?.id],
    queryFn: () => getLessonPlans(user?.id),
    enabled: !!user?.id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LessonPlanData) => generateLessonPlan(data),
    onSuccess: () => {
      toast({
        title: 'Plan de leçon créé !',
        description: 'Votre plan de leçon a été créé avec succès.',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur lors de la création du plan de leçon.',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadSavedPlans = async () => {
    try {
      const plans = await getSavedLessonPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const handleSelectPlan = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      lessonPlan: plan.content,
      classLevel: plan.class_level || '',
      subject: plan.subject || '',
      totalSessions: plan.total_sessions?.toString() || '',
      additionalInstructions: plan.additional_instructions || ''
    }));
  };

  const formatTitle = (title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  };

  const handleGenerate = async () => {
    if (!formData.classLevel || !formData.totalSessions) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return;
    }
    setIsLoading(true);
    const startTime = performance.now();
    try {
      const {
        data: functionData,
        error: functionError
      } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          classLevel: formData.classLevel,
          totalSessions: formData.totalSessions,
          subject: formData.subject,
          text: formData.text,
          additionalInstructions: formData.additionalInstructions
        }
      });
      if (functionError) {
        throw functionError;
      }
      const generationTime = Math.round(performance.now() - startTime);
      setFormData(prev => ({
        ...prev,
        lessonPlan: functionData.lessonPlan
      }));
      await saveLessonPlan({
        title: formatTitle(`${formData.subject || ''} - ${formData.classLevel}`.trim()),
        content: functionData.lessonPlan,
        subject: formData.subject,
        class_level: formData.classLevel,
        total_sessions: parseInt(formData.totalSessions),
        additional_instructions: formData.additionalInstructions
      });
      await logToolUsage('lesson_plan', 'generate', functionData.lessonPlan.length, generationTime);
      await loadSavedPlans();

      toast({
        description: "Votre séquence a été générée et sauvegardée avec succès !"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération de la séquence."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const getRelativeDate = (date: string) => {
    return formatDistanceToNowStrict(new Date(date), {
      addSuffix: true,
      locale: fr
    }).replace('dans ', 'il y a ');
  };

  const formatPreviewContent = (content: string) => {
    const cleanContent = content.replace(/^Séquence pédagogique[\s-]*/i, '').replace(/^###\s*/gm, '').replace(/^\s*\*\*/gm, '').replace(/\*\*\s*$/gm, '').trim();
    return cleanContent;
  };

  const transformSavedPlansToHistoryItems = (plans: LessonPlan[]) => {
    return plans.map(plan => ({
      id: plan.id,
      title: formatTitle(plan.title),
      content: plan.content,
      subject: plan.subject,
      created_at: plan.created_at,
      type: 'lesson-plan' as const,
      displayType: 'Séquence',
      tags: [{
        label: 'Séquence',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }));
  };

  const handleGenerateLessonPlan = () => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour générer un plan de leçon.',
        variant: 'destructive',
      });
      return;
    }

    const lessonPlanData: LessonPlanData = {
      userId: user.id,
      title,
      subject,
      level,
      topic,
      duration,
      learningObjectives,
      materials,
      activities,
      assessment,
      differentiation,
      notes,
      type: 'lesson-plan',
      tags: [{
        label: 'Pédagogie',
        color: 'text-sky-500',
        backgroundColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/30',
      }]
    };

    mutate(lessonPlanData);
  };

  const filteredItems = (lessonPlans as LessonPlan[] | undefined)?.filter((item) => {
    if (!item) return false;
    
    const searchTerm = search.toLowerCase();
    const itemTitle = item.title?.toLowerCase() || '';
    const itemSubject = item.subject?.toLowerCase() || '';

    const dateMatches = !date?.from || !date?.to ||
      (new Date(item.created_at) >= date.from && new Date(item.created_at) <= date.to);

    const tagMatches = selectedTags.length === 0 ||
      (item.tags && item.tags.some(tag => selectedTags.includes(tag.label)));

    const searchMatches = searchTerm === '' ||
      itemTitle.includes(searchTerm) ||
      itemSubject.includes(searchTerm);

    return dateMatches && tagMatches && searchMatches;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
            <Tabs defaultValue="subject" className="mb-6">
              <TabsList className="grid grid-cols-2 gap-4">
                <TabsTrigger value="subject">Programme scolaire</TabsTrigger>
                <TabsTrigger value="text">Texte</TabsTrigger>
              </TabsList>
              <TabsContent value="subject">
                <SubjectTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
              <TabsContent value="text">
                <TextTab formData={formData} handleInputChange={handleInputChange} showCommonFields={false} />
              </TabsContent>
            </Tabs>
            <CommonFields formData={formData} handleInputChange={handleInputChange} />
            <div className="mt-8">
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                <Wand2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Génération en cours...' : 'Générer la séquence'}
              </Button>
            </div>
          </div>
          
          <HistoryCarousel
            items={transformSavedPlansToHistoryItems(savedPlans)}
            onItemSelect={handleSelectPlan}
            selectedItemId={selectedPlan?.id}
          />
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          <ResultDisplay lessonPlan={formData.lessonPlan} />
        </div>
      </div>
    </div>
  );
}
