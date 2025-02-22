
import { SEO } from "@/components/SEO";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { useExerciseGeneration } from "@/hooks/useExerciseGeneration";
import { Link } from "react-router-dom";
import { Tiles } from "@/components/ui/tiles";

export default function ExercisePage() {
  const { exercises } = useExerciseGeneration();

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
            <ExerciseForm />
            <ResultDisplay exercises={exercises} />
          </div>
        </div>
      </div>
    </>
  );
}
