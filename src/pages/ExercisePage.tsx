
import { ResultDisplay } from "@/components/exercise";
import { useExercisePageState } from "@/hooks/exercise/useExercisePageState";
import { SaveErrorAlert } from "@/components/exercise/form/SaveErrorAlert";
import { ExerciseFormTabs } from "@/components/exercise/form/ExerciseFormTabs";
import { ExercisePageHeader } from "@/components/exercise/ExercisePageHeader";

export default function ExercisePage() {
  const {
    exercises,
    activeTab,
    formData,
    isLoading,
    isSaving,
    lastSaveError,
    lastGeneratedId,
    handleInputChange,
    handleSubmit,
    handleTabChange,
    handleRetrySave
  } = useExercisePageState();

  return (
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

        {exercises && <ResultDisplay exercises={exercises} exerciseId={lastGeneratedId} />}
      </div>
    </div>
  );
}
