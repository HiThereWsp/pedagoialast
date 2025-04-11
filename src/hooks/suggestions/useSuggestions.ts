import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { UseSuggestionsResult, Comment } from './types';
import { useSuggestionState } from './useSuggestionState';
import { useSuggestionVoting } from './useSuggestionVoting';
import { useSuggestionFiltering } from './useSuggestionFiltering';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSuggestions = (): UseSuggestionsResult => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  
  const {
    isLoading,
    suggestions,
    setSuggestions,
    newSuggestion,
    showNewSuggestionForm,
    setShowNewSuggestionForm,
    handleSuggestionChange,
    fetchSuggestions,
    handleAddSuggestion
  } = useSuggestionState();

  const {
    userVotes,
    fetchUserVotes,
    handleVote,
    canVote,
    isAuthenticated,
    isOwnSuggestion
  } = useSuggestionVoting(suggestions, setSuggestions);

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    filteredSuggestions
  } = useSuggestionFiltering(suggestions);

  // Fonction pour charger les commentaires
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Organiser les commentaires par suggestion_id
      const commentsBySuggestion: Record<string, Comment[]> = {};
      data.forEach(comment => {
        if (!commentsBySuggestion[comment.suggestion_id]) {
          commentsBySuggestion[comment.suggestion_id] = [];
        }
        commentsBySuggestion[comment.suggestion_id].push(comment);
      });
      
      setComments(commentsBySuggestion);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  // Fonction pour ajouter un commentaire
  const addComment = async (suggestionId: string, text: string) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour commenter.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const newComment = {
        suggestion_id: suggestionId,
        user_id: user.id,
        author: user.email || 'Utilisateur',
        text,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert(newComment)
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Mettre à jour l'état local
      setComments(prev => ({
        ...prev,
        [suggestionId]: [...(prev[suggestionId] || []), data]
      }));
      
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été ajouté avec succès."
      });
      
      return data;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du commentaire.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Récupérer les suggestions et les votes au chargement
  useEffect(() => {
    fetchSuggestions();
    if (user) {
      fetchUserVotes();
      fetchComments();
    }
  }, [user, fetchSuggestions, fetchUserVotes]);

  // Charger les commentaires quand les suggestions changent
  useEffect(() => {
    if (suggestions.length > 0) {
      fetchComments();
    }
  }, [suggestions]);

  // Ajoutez cette fonction au hook useSuggestions pour vérifier et corriger les compteurs de votes
  const syncVoteCounts = async () => {
    try {
      // Pour chaque suggestion, compter directement le nombre de votes "up" moins le nombre de votes "down"
      for (const suggestion of suggestions) {
        const { data: upVotes, error: upError } = await supabase
          .from('suggestion_votes')
          .select('id')
          .eq('suggestion_id', suggestion.id)
          .eq('vote_type', 'up');
          
        if (upError) throw upError;
        
        const { data: downVotes, error: downError } = await supabase
          .from('suggestion_votes')
          .select('id')
          .eq('suggestion_id', suggestion.id)
          .eq('vote_type', 'down');
          
        if (downError) throw downError;
        
        const netVotes = (upVotes?.length || 0) - (downVotes?.length || 0);
        
        // Si le compteur est différent de ce qui est en base, le mettre à jour
        if (suggestion.votes !== netVotes) {
          console.log(`Correction du compteur de votes pour ${suggestion.id}: ${suggestion.votes} -> ${netVotes}`);
          
          // Mettre à jour la base de données
          const { error: updateError } = await supabase
            .from('suggestions')
            .update({ votes: netVotes })
            .eq('id', suggestion.id);
            
          if (updateError) throw updateError;
          
          // Mettre à jour l'état local
          setSuggestions(prevSuggestions => 
            prevSuggestions.map(s => s.id === suggestion.id ? { ...s, votes: netVotes } : s)
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des votes:', error);
    }
  };

  // Appelez cette fonction au chargement initial des suggestions
  useEffect(() => {
    if (suggestions.length > 0 && isAuthenticated) {
      syncVoteCounts();
    }
  }, [suggestions.length, isAuthenticated]);

  return {
    isLoading,
    suggestions,
    userVotes,
    comments,
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
    addComment,
    filteredSuggestions,
    refetchSuggestions: fetchSuggestions,
    canVote,
    isAuthenticated,
    isOwnSuggestion
  };
};
