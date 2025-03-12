
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { initialSuggestions } from "@/data/suggestions";
import { Suggestion, SuggestionVote, NewSuggestionForm, UseSuggestionsResult } from './types';

export const useSuggestions = (): UseSuggestionsResult => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchUserVotes = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la récupération des votes:', error);
        return;
      }

      if (data) {
        setUserVotes(data.map(vote => vote.suggestion_id));
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  }, [user]);

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

  const handleVote = async (id: string, increment: boolean) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour voter.",
        variant: "destructive"
      });
      return;
    }

    const voteChange = increment ? 1 : -1;
    
    // Si l'utilisateur essaie d'ajouter un vote
    if (increment) {
      // Vérifier si l'utilisateur a déjà voté pour cette suggestion
      if (userVotes.includes(id)) {
        toast({
          title: "Vote déjà enregistré",
          description: "Vous avez déjà voté pour cette suggestion."
        });
        return;
      }
      
      // Enregistrer le vote
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .insert({ user_id: user.id, suggestion_id: id });
        
      if (voteError) {
        console.error('Erreur lors de l\'ajout du vote:', voteError);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre vote.",
          variant: "destructive"
        });
        return;
      }
      
      // Mettre à jour la liste des votes de l'utilisateur
      setUserVotes([...userVotes, id]);
    } else {
      // Si l'utilisateur retire son vote
      if (!userVotes.includes(id)) {
        toast({
          title: "Aucun vote à retirer",
          description: "Vous n'avez pas voté pour cette suggestion."
        });
        return;
      }
      
      // Supprimer le vote
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('suggestion_id', id);
        
      if (voteError) {
        console.error('Erreur lors de la suppression du vote:', voteError);
        toast({
          title: "Erreur",
          description: "Impossible de retirer votre vote.",
          variant: "destructive"
        });
        return;
      }
      
      // Mettre à jour la liste des votes de l'utilisateur
      setUserVotes(userVotes.filter(v => v !== id));
    }
    
    // Récupérer la suggestion actuelle
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) return;
    
    // Mettre à jour le compteur de votes de la suggestion
    const { error: updateError } = await supabase
      .from('suggestions')
      .update({ votes: suggestion.votes + voteChange })
      .eq('id', id);
      
    if (updateError) {
      console.error('Erreur lors de la mise à jour des votes:', updateError);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le compteur de votes.",
        variant: "destructive"
      });
      return;
    }
    
    // Mettre à jour l'état local
    setSuggestions(suggestions.map(s =>
      s.id === id
        ? { ...s, votes: s.votes + voteChange }
        : s
    ));
    
    toast({
      title: increment ? "Vote ajouté" : "Vote retiré",
      description: increment 
        ? "Votre vote a été ajouté avec succès." 
        : "Votre vote a été retiré avec succès."
    });
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

  const handleSuggestionChange = (field: 'title' | 'description', value: string) => {
    setNewSuggestion(prev => ({ ...prev, [field]: value }));
  };

  // Récupérer les suggestions et les votes au chargement
  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchUserVotes();
    }
  }, [user, fetchSuggestions, fetchUserVotes]);

  // Filtrer et trier les suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestions
      .filter(suggestion => 
        suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(suggestion => 
        selectedStatus === 'tous' || suggestion.status === selectedStatus
      )
      .sort((a, b) => {
        if (sortBy === 'votes') return b.votes - a.votes;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [suggestions, searchTerm, selectedStatus, sortBy]);

  return {
    isLoading,
    suggestions,
    userVotes,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    showNewSuggestionForm,
    setShowNewSuggestionForm,
    newSuggestion,
    handleSuggestionChange,
    handleVote,
    handleAddSuggestion,
    filteredSuggestions,
    refetchSuggestions: fetchSuggestions
  };
};
