
import { User } from "@supabase/supabase-js";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: 'créé' | 'complété' | string;
  author: string;
  created_at: string;
}

export interface SuggestionVote {
  id: string;
  user_id: string;
  suggestion_id: string;
  created_at: string;
}

export interface NewSuggestionForm {
  title: string;
  description: string;
}

export interface UseSuggestionsResult {
  isLoading: boolean;
  suggestions: Suggestion[];
  userVotes: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: 'votes' | 'recent';
  setSortBy: (sort: 'votes' | 'recent') => void;
  showNewSuggestionForm: boolean;
  setShowNewSuggestionForm: (show: boolean) => void;
  newSuggestion: NewSuggestionForm;
  handleSuggestionChange: (field: 'title' | 'description', value: string) => void;
  handleVote: (id: string, increment: boolean) => Promise<void>;
  handleAddSuggestion: () => Promise<void>;
  filteredSuggestions: Suggestion[];
  refetchSuggestions: () => Promise<void>;
}
