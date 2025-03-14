
import { useState, useEffect } from "react";
import { ExerciseForm, ResultDisplay } from "@/components/exercise";
import { useExerciseGeneration } from "@/hooks/useExerciseGeneration";
import type { ExerciseFormData } from "@/types/saved-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DifferentiateExerciseForm from "@/components/exercise/form/DifferentiateExerciseForm";
import { AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Formulaire par défaut vide
const defaultFormData: ExerciseFormData = {
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
};

export default function ExercisePage() {
  const { 
    generateExercises, 
    isLoading, 
    isSaving,
    lastSaveError,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise
  } = useExerciseGeneration();
  
  const [exercises, setExercises] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"create" | "differentiate">("create");
  const [formData, setFormData] = useState<ExerciseFormData>(defaultFormData);
  const [isCachedDataLoaded, setIsCachedDataLoaded] = useState(false);

  // Charger les données du cache lors du premier rendu
  useEffect(() => {
    console.log('Chargement initial des données du cache...');
    const cacheState = getExerciseCacheState();
    
    if (cacheState.formData) {
      console.log('Données de formulaire trouvées dans le cache');
      setFormData({
        ...defaultFormData,
        ...cacheState.formData
      });
    }
    
    if (cacheState.exerciseResult) {
      console.log('Résultat d\'exercice trouvé dans le cache');
      setExercises(cacheState.exerciseResult);
    }
    
    if (cacheState.activeTab) {
      console.log('Onglet actif trouvé dans le cache:', cacheState.activeTab);
      setActiveTab(cacheState.activeTab);
    }
    
    setIsCachedDataLoaded(true);
  }, [getExerciseCacheState]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Soumission du formulaire, génération d\'exercice...');
    
    // On garde le résultat actuel seulement si la génération échoue
    const currentExercises = exercises;
    
    // Réinitialisation de l'état des exercices pour éviter la persistance visuelle
    setExercises("");
    
    const result = await generateExercises(formData, activeTab === "differentiate");
    
    if (result) {
      console.log('Exercice généré avec succès, mise à jour de l\'affichage');
      setExercises(result);
    } else {
      // Si erreur, restaurer l'état précédent pour éviter une page vide
      console.log('Échec de la génération, restauration de l\'état précédent');
      setExercises(currentExercises);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    
    console.log('Changement d\'onglet:', tab);
    setActiveTab(tab as "create" | "differentiate");
    
    // Effacer les exercices lors du changement d'onglet pour éviter la confusion
    setExercises("");
    
    // Réinitialiser certains champs du formulaire spécifiques à chaque onglet
    if (tab === "create") {
      setFormData(prev => ({
        ...prev,
        originalExercise: "",
        studentProfile: "",
        learningDifficulties: "",
        challenges: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        objective: ""
      }));
    }
  };

  // Fonction pour réessayer la sauvegarde
  const handleRetrySave = async () => {
    if (exercises) {
      await retrySaveExercise(formData, exercises, activeTab === "differentiate");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight text-balance">
          Générateur d'exercices
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Créez des exercices adaptés à vos besoins pédagogiques
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {lastSaveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors de la sauvegarde : {lastSaveError}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4" 
                onClick={handleRetrySave}
                disabled={isSaving}
              >
                {isSaving ? "Sauvegarde..." : "Réessayer"} <Save className="h-4 w-4 ml-2" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
  );
}
