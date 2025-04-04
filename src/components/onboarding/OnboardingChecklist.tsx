import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    hasBeenShown,
    markAsShown 
  } = useOnboarding();
  
  // Marquer comme montré au premier affichage
  useEffect(() => {
    if (!hasBeenShown) {
      markAsShown();
    }
  }, []);
  
  // Ne pas afficher si déjà complété ou déjà montré
  if (isAllCompleted || hasBeenShown) {
    return null;
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
                  className={`text-sm text-gray-800 cursor-pointer ${
                    completedTasks[index] ? "line-through text-gray-500" : ""
                  }`}
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
