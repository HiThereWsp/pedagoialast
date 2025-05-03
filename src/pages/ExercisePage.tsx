import { ResultDisplay } from "@/components/exercise";
import { useExercisePageState } from "@/hooks/exercise/useExercisePageState";
import { SaveErrorAlert } from "@/components/exercise/form/SaveErrorAlert";
import { ExerciseFormTabs } from "@/components/exercise/form/ExerciseFormTabs";
import { ExercisePageHeader } from "@/components/exercise/ExercisePageHeader";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";

export default function ExercisePage() {
  const {
    exercises,
    activeTab,
    formData,
    isLoading,
    isModifying,
    isSaving,
    lastSaveError,
    lastGeneratedId,
    handleInputChange,
    handleSubmit,
    handleTabChange,
    handleRetrySave,
    handleModifyExercise,
  } = useExercisePageState();

  // Log pour le débogage - s'assurer que handleModifyExercise est disponible
  useEffect(() => {
    if (exercises) {
      console.log("Fonction de modification disponible:", !!handleModifyExercise);
    }
  }, [exercises, handleModifyExercise]);

  // Fonction explicite pour la modification
  const onModifyRequest = (instructions: string) => {
    console.log("Demande de modification reçue avec instructions:", instructions);
    if (handleModifyExercise) {
      handleModifyExercise(instructions);
    }
  };

  return (
    <>
      <SEO 
        title="Générateur d'exercices pédagogiques | PedagoIA"
        description="Créez des exercices adaptés à vos besoins pédagogiques grâce à l'IA."
      />
      <div className="container mx-auto px-4 py-8">
        <ExercisePageHeader />

        <div className="max-w-4xl mx-auto">
          <SaveErrorAlert 
            error={lastSaveError} 
            isSaving={isSaving} 
            onRetry={handleRetrySave} 
          />

          <ExerciseFormTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          {exercises && (
            <>
              <ResultDisplay 
                exercises={exercises} 
                exerciseId={lastGeneratedId} 
                isModifying={isModifying}
                onModifyRequest={onModifyRequest}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
