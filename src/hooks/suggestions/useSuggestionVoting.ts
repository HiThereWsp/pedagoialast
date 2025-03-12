
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Suggestion, SuggestionVotingResult } from './types';

export const useSuggestionVoting = (
  suggestions: Suggestion[],
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>
): SuggestionVotingResult => {
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;

  const fetchUserVotes = useCallback(async () => {
    if (!user) {
      setUserVotes({});
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id, vote_type')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la récupération des votes:', error);
        return;
      }

      if (data) {
        const votes: Record<string, 'up' | 'down'> = {};
        data.forEach(vote => {
          votes[vote.suggestion_id] = vote.vote_type as 'up' | 'down';
        });
        setUserVotes(votes);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  const isOwnSuggestion = useCallback((suggestionId: string) => {
    if (!user) return false;
    
    const suggestion = suggestions.find(s => s.id === suggestionId);
    return suggestion?.author_id === user.id;
  }, [user, suggestions]);

  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour voter.",
        variant: "destructive"
      });
      return;
    }
    
    if (isOwnSuggestion(id)) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas voter pour vos propres suggestions.",
        variant: "destructive"
      });
      return;
    }
    
    const currentVote = userVotes[id];
    let voteChange = 0;
    
    try {
      // Si l'utilisateur a déjà voté pour cette suggestion
      if (currentVote) {
        // Si c'est le même type de vote, supprimer le vote
        if (currentVote === voteType) {
          const { error } = await supabase
            .from('suggestion_votes')
            .delete()
            .eq('user_id', user.id)
            .eq('suggestion_id', id);
            
          if (error) throw error;
          
          // Mettre à jour le compteur selon le type de vote retiré
          voteChange = voteType === 'up' ? -1 : 1;
          
          // Mettre à jour l'état local des votes
          const newUserVotes = { ...userVotes };
          delete newUserVotes[id];
          setUserVotes(newUserVotes);
          
          toast({
            title: "Vote retiré",
            description: "Votre vote a été retiré avec succès."
          });
        } 
        // Si c'est un type de vote différent, mettre à jour le vote
        else {
          const { error } = await supabase
            .from('suggestion_votes')
            .update({ vote_type: voteType })
            .eq('user_id', user.id)
            .eq('suggestion_id', id);
            
          if (error) throw error;
          
          // Mettre à jour le compteur (changement double car on passe de +1 à -1 ou vice versa)
          voteChange = voteType === 'up' ? 2 : -2;
          
          // Mettre à jour l'état local des votes
          setUserVotes({ ...userVotes, [id]: voteType });
          
          toast({
            title: "Vote modifié",
            description: `Votre vote a été changé en vote ${voteType === 'up' ? 'positif' : 'négatif'}.`
          });
        }
      } 
      // Si l'utilisateur n'a pas encore voté pour cette suggestion
      else {
        const { error } = await supabase
          .from('suggestion_votes')
          .insert({ 
            user_id: user.id, 
            suggestion_id: id,
            vote_type: voteType
          });
          
        if (error) throw error;
        
        // Mettre à jour le compteur selon le type de vote
        voteChange = voteType === 'up' ? 1 : -1;
        
        // Mettre à jour l'état local des votes
        setUserVotes({ ...userVotes, [id]: voteType });
        
        toast({
          title: "Vote ajouté",
          description: `Votre vote ${voteType === 'up' ? 'positif' : 'négatif'} a été enregistré.`
        });
      }
      
      // Mettre à jour le compteur de votes de la suggestion
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) return;
      
      const { error: updateError } = await supabase
        .from('suggestions')
        .update({ votes: suggestion.votes + voteChange })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // Mettre à jour l'état local des suggestions
      setSuggestions(suggestions.map(s =>
        s.id === id
          ? { ...s, votes: s.votes + voteChange }
          : s
      ));
      
    } catch (error: any) {
      console.error('Erreur lors de la gestion du vote:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de votre vote.",
        variant: "destructive"
      });
    }
  };

  return {
    userVotes,
    setUserVotes,
    fetchUserVotes,
    handleVote,
    canVote: isAuthenticated,
    isAuthenticated,
    isOwnSuggestion
  };
};
