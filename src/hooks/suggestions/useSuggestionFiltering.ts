
import { useState, useMemo } from 'react';
import { Suggestion, SuggestionFilteringResult } from './types';

export const useSuggestionFiltering = (
  suggestions: Suggestion[]
): SuggestionFilteringResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

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
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    filteredSuggestions
  };
};
