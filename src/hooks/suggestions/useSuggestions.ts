
import { useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { UseSuggestionsResult } from './types';
import { useSuggestionState } from './useSuggestionState';
import { useSuggestionVoting } from './useSuggestionVoting';
import { useSuggestionFiltering } from './useSuggestionFiltering';

export const useSuggestions = (): UseSuggestionsResult => {
  const { user } = useAuth();
  
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
    canVote
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

  // Récupérer les suggestions et les votes au chargement
  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchUserVotes();
    }
  }, [user, fetchSuggestions, fetchUserVotes]);

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
    refetchSuggestions: fetchSuggestions,
    canVote
  };
};
