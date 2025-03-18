
import React from 'react';
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Wand2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingIndicator />
          <span>Génération en cours...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-5 w-5" />
          <span>Générer les exercices</span>
        </>
      )}
    </Button>
  );
};
