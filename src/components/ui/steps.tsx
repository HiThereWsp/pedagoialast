import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  description?: string;
}

export const Step: React.FC<StepProps> = () => {
  // Ce composant est juste un conteneur pour les propriétés, il n'affiche rien directement
  return null;
};

interface StepsProps {
  children: React.ReactNode;
  currentStep: number;
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({ 
  children, 
  currentStep, 
  className 
}) => {
  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between">
        {steps.map((step, i) => {
          if (!React.isValidElement(step)) return null;
          
          const { title, description } = step.props;
          const isActive = currentStep === i;
          const isCompleted = currentStep > i;
          
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center space-y-2 relative", 
                "flex-1",
                i !== steps.length - 1 ? "after:absolute after:w-full after:h-0.5 after:bg-gray-200 after:top-5 after:left-1/2 after:z-0" : ""
              )}
            >
              {/* Ligne de connexion (remplie si complétée) */}
              {i !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 w-full h-0.5 left-1/2 -z-10",
                    isCompleted ? "bg-gradient-to-r from-[#F47C7C] to-[#AC7AB5]" : "bg-gray-200"
                  )}
                />
              )}
              
              {/* Cercle d'étape */}
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full z-10",
                  "border-2",
                  isActive 
                    ? "border-[#AC7AB5] text-[#AC7AB5]" 
                    : isCompleted 
                      ? "border-none bg-gradient-to-r from-[#F47C7C] to-[#AC7AB5] text-white" 
                      : "border-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              
              {/* Titre et description */}
              <div className="text-center">
                <div 
                  className={cn(
                    "text-sm font-medium", 
                    isActive ? "text-[#AC7AB5]" : isCompleted ? "text-gray-700" : "text-gray-400"
                  )}
                >
                  {title}
                </div>
                {description && (
                  <div className="mt-1 text-xs text-gray-500 max-w-[120px] text-center">
                    {description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 