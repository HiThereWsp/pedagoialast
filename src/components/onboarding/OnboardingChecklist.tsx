
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { useOnboarding } from "@/hooks/useOnboarding";

const onboardingTasks = [
  "Créer votre première séquence pédagogique",
  "Créer un exercice pour votre séquence",
  "Faire de la différenciation sur des exercices existants",
  "Rédiger votre première correspondance",
  "Illustrer vos cours avec des images personnalisées",
  "Demander ou voter pour de nouveaux outils",
];

export function OnboardingChecklist() {
  const { 
    completedTasks, 
    toggleTask, 
    isAllCompleted, 
    markAllCompleted 
  } = useOnboarding();
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isAllCompleted) {
      // Check if premium welcome was already shown to avoid duplicate confetti
      const premiumWelcomeShown = localStorage.getItem('premium_welcome_shown') === 'true';
      
      if (!premiumWelcomeShown) {
        setShowConfetti(true);
        
        // Hide confetti after animation
        const timer = setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAllCompleted]);

  if (isAllCompleted) {
    return (
      <div className="fixed bottom-[120px] left-4 z-50 md:absolute">
        {showConfetti && <Confetti className="fixed inset-0 z-50" />}
        <Card className="bg-yellow-100 border-yellow-300 shadow-md animate-fade-in">
          <CardContent className="p-4 flex items-center gap-2">
            <CheckCircle className="text-yellow-600 w-6 h-6" />
            <span className="text-yellow-900 font-bold">
              🎉 Félicitations ! Tu as maintenant les clés pour reprendre le controle de ton temps ! 🔑
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-[120px] left-4 w-80 z-50 md:absolute">
      <Card className="shadow-lg animate-fade-in">
        <CardContent className="p-4">
          <div className="mb-2 font-semibold text-purple-800">
            🎯 Gagnez 6h de votre temps dès maintenant :
          </div>
          <ul className="space-y-2">
            {onboardingTasks.map((task, index) => (
              <li key={index} className="flex items-start gap-2">
                <Checkbox 
                  id={`task-${index}`}
                  checked={completedTasks[index]} 
                  onCheckedChange={() => toggleTask(index)}
                />
                <label 
                  htmlFor={`task-${index}`}
                  className="text-sm text-gray-800 cursor-pointer"
                >
                  {task}
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingChecklist;
