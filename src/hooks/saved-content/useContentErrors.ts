
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContentErrors } from "./types";

/**
 * Hook pour gérer les erreurs liées au contenu
 */
export function useContentErrors() {
  const [errors, setErrors] = useState<ContentErrors>({});
  const { toast } = useToast();

  // Ajouter une erreur à une catégorie spécifique
  const addError = useCallback((category: keyof ContentErrors, message: string) => {
    setErrors(prev => ({ ...prev, [category]: message }));
  }, []);

  // Supprimer une erreur d'une catégorie spécifique
  const clearError = useCallback((category: keyof ContentErrors) => {
    setErrors(prev => ({ ...prev, [category]: undefined }));
  }, []);

  // Réinitialiser toutes les erreurs
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Afficher une toast d'erreur
  const showErrorToast = useCallback((title: string, description: string) => {
    toast({
      variant: "destructive",
      title,
      description
    });
  }, [toast]);

  return {
    errors,
    addError,
    clearError,
    clearAllErrors,
    showErrorToast
  };
}
