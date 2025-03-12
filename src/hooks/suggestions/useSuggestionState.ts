
import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { initialSuggestions } from "@/data/suggestions";
import { 
  Suggestion, 
  NewSuggestionForm, 
  SuggestionStateResult 
} from './types';

export const useSuggestionState = (): SuggestionStateResult => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState<NewSuggestionForm>({
    title: '',
    description: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les suggestions.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        setSuggestions(data as Suggestion[]);
      } else {
        // Si aucune suggestion n'est trouvée, initialisons avec les données par défaut
        await initializeDefaultSuggestions();
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const initializeDefaultSuggestions = async () => {
    try {
      for (const suggestion of initialSuggestions) {
        await supabase.from('suggestions').insert(suggestion);
      }
      // Récupérer les suggestions après initialisation
      const { data } = await supabase
        .from('suggestions')
        .select('*')
        .order('votes', { ascending: false });
      
      if (data) {
        setSuggestions(data as Suggestion[]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des suggestions:', error);
    }
  };

  const handleSuggestionChange = (field: 'title' | 'description', value: string) => {
    setNewSuggestion(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSuggestion = async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour ajouter une suggestion.",
        variant: "destructive"
      });
      return;
    }

    if (newSuggestion.title && newSuggestion.description) {
      const suggestion = {
        id: `suggestion-${Date.now()}`,
        ...newSuggestion,
        votes: 0,
        status: 'créé',
        author: user.email?.split('@')[0] || "Utilisateur",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('suggestions')
        .insert(suggestion);

      if (error) {
        console.error('Erreur lors de l\'ajout de la suggestion:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter votre suggestion.",
          variant: "destructive"
        });
        return;
      }

      setSuggestions([suggestion, ...suggestions]);
      setNewSuggestion({ title: '', description: '' });
      setShowNewSuggestionForm(false);
      
      toast({
        title: "Suggestion ajoutée",
        description: "Votre suggestion a été ajoutée avec succès."
      });
    }
  };

  return {
    isLoading,
    suggestions,
    setSuggestions,
    newSuggestion,
    setNewSuggestion,
    showNewSuggestionForm,
    setShowNewSuggestionForm,
    handleSuggestionChange,
    fetchSuggestions,
    handleAddSuggestion
  };
};
