
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Suggestion, SuggestionVotingResult } from './types';

export const useSuggestionVoting = (
  suggestions: Suggestion[],
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>
): SuggestionVotingResult => {
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  const handleVote = async (id: string, increment: boolean) => {
    // We no longer check for authentication
    
    const voteChange = increment ? 1 : -1;
    
    // Enregistrer le vote sans vérifications
    if (increment) {
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .insert({ user_id: user?.id || 'anonymous', suggestion_id: id });
        
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
      // Supprimer le vote sans vérifications
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .delete()
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

  return {
    userVotes,
    setUserVotes,
    fetchUserVotes,
    handleVote,
    canVote: true // Toujours permettre le vote
  };
};
