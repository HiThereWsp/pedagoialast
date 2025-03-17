
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseForm from "@/components/exercise/ExerciseForm";
import DifferentiateExerciseForm from "@/components/exercise/form/DifferentiateExerciseForm";
import type { ExerciseFormData } from "@/types/saved-content";

interface ExerciseFormTabsProps {
  activeTab: "create" | "differentiate";
  onTabChange: (tab: string) => void;
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ExerciseFormTabs({
  activeTab,
  onTabChange,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading
}: ExerciseFormTabsProps) {
  return (
    <Tabs 
      value={activeTab}
      onValueChange={onTabChange}
      className="mb-8"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Créer</TabsTrigger>
        <TabsTrigger value="differentiate">Différencier</TabsTrigger>
      </TabsList>
      
      <TabsContent value="create" className="mt-6">
        <ExerciseForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="differentiate" className="mt-6">
        <DifferentiateExerciseForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
