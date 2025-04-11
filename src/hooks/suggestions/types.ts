import { User } from "@supabase/supabase-js";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: 'créé' | 'complété' | string;
  author: string;
  author_id?: string;
  created_at: string;
  type?: 'feature_request' | 'tool_improvement';
  tool_name?: string;
}

export interface SuggestionVote {
  id: string;
  user_id: string;
  suggestion_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface NewSuggestionForm {
  title: string;
  description: string;
}

export interface Comment {
  id: string;
  suggestion_id: string;
  user_id: string;
  author: string;
  text: string;
  created_at: string;
}

export interface UseSuggestionsResult {
  isLoading: boolean;
  suggestions: Suggestion[];
  userVotes: Record<string, 'up' | 'down'>;
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
  handleVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  handleAddSuggestion: () => Promise<void>;
  filteredSuggestions: Suggestion[];
  refetchSuggestions: () => Promise<void>;
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: (suggestionId: string) => boolean;
  comments: Record<string, Comment[]>;
  addComment: (suggestionId: string, text: string) => Promise<Comment | null>;
}

export interface SuggestionStateResult {
  isLoading: boolean;
  suggestions: Suggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
  newSuggestion: NewSuggestionForm;
  setNewSuggestion: React.Dispatch<React.SetStateAction<NewSuggestionForm>>;
  showNewSuggestionForm: boolean;
  setShowNewSuggestionForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleSuggestionChange: (field: 'title' | 'description', value: string) => void;
  fetchSuggestions: () => Promise<void>;
  handleAddSuggestion: () => Promise<void>;
}

export interface SuggestionVotingResult {
  userVotes: Record<string, 'up' | 'down'>;
  setUserVotes: React.Dispatch<React.SetStateAction<Record<string, 'up' | 'down'>>>;
  fetchUserVotes: () => Promise<void>;
  handleVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: (suggestionId: string) => boolean;
}

export interface SuggestionFilteringResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: 'votes' | 'recent';
  setSortBy: (sort: 'votes' | 'recent') => void;
  filteredSuggestions: Suggestion[];
}
