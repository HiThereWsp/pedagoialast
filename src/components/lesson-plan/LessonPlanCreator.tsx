import React, { useRef, useEffect, useMemo, useState } from 'react';
import { LessonPlanForm } from './LessonPlanForm';
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useLessonPlanGeneration } from '@/hooks/lesson-plan/useLessonPlanGeneration';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenLine, RefreshCw } from 'lucide-react';

export function LessonPlanCreator() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const modificationFormRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showNewBadge, setShowNewBadge] = useState(true);
  const {
    formData,
    isGenerating,
    isModifying,
    showModificationForm,
    modificationInstructions,
    generate,
    modifyPlan,
    toggleModificationForm,
    handleModificationInstructionsChange,
    handleInputChange,
    resetLessonPlan
  } = useLessonPlanGeneration();

  // Memoized content ID for feedback - using a proper UUID format
  const contentId = useMemo(() => {
    // Generate a stable UUID if there's lesson plan content
    if (formData.lessonPlan) {
      // Use crypto.randomUUID() for standard UUID generation
      return crypto.randomUUID();
    }
    return undefined;
  }, [formData.lessonPlan]);

  useEffect(() => {
    if (formData.lessonPlan && scrollRef.current) {
      // Only scroll if the user has just generated a lesson plan (isLoading just turned false)
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formData.lessonPlan]);

  // Effet pour faire défiler vers le formulaire de modification lorsqu'il est affiché
  useEffect(() => {
    if (showModificationForm && modificationFormRef.current) {
      modificationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showModificationForm]);

  // Masquer le badge "Nouveau" quand l'utilisateur clique sur le bouton
  useEffect(() => {
    if (showModificationForm) {
      setShowNewBadge(false);
    }
  }, [showModificationForm]);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <LessonPlanForm
          formData={formData}
          isLoading={isGenerating}
          onInputChange={handleInputChange}
          onGenerate={generate}
        />
      </div>
      
      {isGenerating && (
        <div className="flex justify-center py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <LoadingIndicator message="Création de votre séquence pédagogique..." />
          </div>
        </div>
      )}
      
      {isModifying && (
        <div className="flex justify-center py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <LoadingIndicator message="Modification de votre séquence en cours..." />
          </div>
        </div>
      )}
      
      {formData.lessonPlan && !isGenerating && !isModifying && (
        <div ref={scrollRef} className="max-w-6xl mx-auto mt-10">
          <ScrollCard 
            exercises={formData.lessonPlan}
            showCorrection={false}
            className={`min-h-[800px] ${isMobile ? 'p-4' : 'p-8 md:p-12'} animate-fade-in`}
            customClass="text-left"
            disableInternalTabs={true}
            contentType="lesson_plan"
            contentId={contentId}
          />
          
          {/* Bouton pour afficher le formulaire de modification avec badge et animation */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-block">
              {showNewBadge && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce z-10">
                  Nouveau !
                </div>
              )}
              <Button
                onClick={toggleModificationForm}
                variant={showModificationForm ? "outline" : "default"}
                className={`
                  flex items-center gap-2 px-6 py-5 text-base relative overflow-hidden
                  ${showModificationForm 
                    ? "border-2 border-gray-300" 
                    : "bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                  }
                  ${!showModificationForm && !showNewBadge ? "animate-pulse" : ""}
                  transition-all duration-300 transform hover:scale-105
                `}
              >
                {showModificationForm ? (
                  <>
                    <PenLine size={20} />
                    Annuler les modifications
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Modifier la séquence</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></span>
                  </>
                )}
              </Button>
              {!showModificationForm && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  En 1 clic, vous pouvez maintenant utiliser l'IA pour modifier cette séquence comme vous le souhaitez
                </p>
              )}
            </div>
          </div>
          
          {/* Formulaire de modification */}
          {showModificationForm && (
            <div 
              ref={modificationFormRef}
              className="mt-6 bg-white border border-pink-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-lg font-medium mb-4 text-gray-800">
                Demander des modifications
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Décrivez les modifications que vous souhaitez apporter à votre séquence. Soyez aussi précis que possible.
              </p>
              <Textarea
                value={modificationInstructions}
                onChange={(e) => handleModificationInstructionsChange(e.target.value)}
                placeholder="Exemple : Ajouter une activité d'évaluation formative à la séance 2, réduire la durée de la séance 3 à 45 minutes..."
                className="min-h-[150px] mb-4"
              />
              <Button
                onClick={modifyPlan}
                disabled={!modificationInstructions.trim() || isModifying}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${isModifying ? 'animate-spin' : ''}`} />
                Appliquer les modifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
