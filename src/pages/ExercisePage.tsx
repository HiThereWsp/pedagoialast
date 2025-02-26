
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { ExerciseForm, ResultDisplay } from "@/components/exercise";
import { useExerciseGeneration } from "@/hooks/useExerciseGeneration";
import type { ExerciseFormData } from "@/types/saved-content";
import { Link } from "react-router-dom";
import { Tiles } from "@/components/ui/tiles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DifferentiateExerciseForm from "@/components/exercise/form/DifferentiateExerciseForm";

export default function ExercisePage() {
  const { generateExercises, isLoading } = useExerciseGeneration();
  const [exercises, setExercises] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"create" | "differentiate">("create");
  const [formData, setFormData] = useState<ExerciseFormData>({
    subject: "",
    classLevel: "",
    numberOfExercises: "",
    questionsPerExercise: "",
    objective: "",
    exerciseType: "",
    additionalInstructions: "",
    specificNeeds: "",
    originalExercise: "",
    studentProfile: "",
    learningDifficulties: "",
    selectedLessonPlan: "",
    challenges: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generateExercises(formData, activeTab === "differentiate");
    if (result) {
      setExercises(result);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "create" | "differentiate");
    setExercises(""); // Réinitialiser les exercices lors du changement d'onglet
  };

  return (
    <>
      <SEO
        title="Générateur d'exercices | PedagoIA"
        description="Créez des exercices personnalisés pour vos élèves"
      />
      <div className="relative min-h-screen">
        <div className="fixed inset-0 overflow-hidden">
          <Tiles
            rows={50}
            cols={8}
            tileSize="md"
            className="opacity-30"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-8">
          <Link to="/home" className="block mb-8">
            <img
              src="/lovable-uploads/93d432b8-78fb-4807-ba55-719b6b6dc7ef.png"
              alt="PedagoIA Logo"
              className="w-[100px] h-[120px] object-contain mx-auto hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Générateur d'exercices
            </h1>
            <p className="text-muted-foreground">
              Créez des exercices adaptés à vos besoins pédagogiques
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs 
              defaultValue="create" 
              value={activeTab}
              onValueChange={handleTabChange}
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

            {exercises && <ResultDisplay exercises={exercises} />}
          </div>
        </div>
      </div>
    </>
  );
}
