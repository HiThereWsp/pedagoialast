
import React from 'react';
import { BackButton } from '@/components/settings/BackButton';
import { NewSuggestionForm } from '@/components/suggestions/NewSuggestionForm';
import { SuggestionFilters } from '@/components/suggestions/SuggestionFilters';
import { HeroSection } from '@/components/suggestions/HeroSection';
import { SortButtons } from '@/components/suggestions/SortButtons';
import { SuggestionsList } from '@/components/suggestions/SuggestionsList';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';

const SuggestionsPage = () => {
  const {
    isLoading,
    handleVote,
    handleAddSuggestion,
    handleSuggestionChange,
    filteredSuggestions,
    userVotes,
    newSuggestion,
    showNewSuggestionForm,
    setShowNewSuggestionForm,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    canVote,
    isAuthenticated,
    isOwnSuggestion
  } = useSuggestions();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <BackButton fallbackPath="/tableaudebord" />
        
        <HeroSection 
          onNewSuggestion={() => setShowNewSuggestionForm(true)}
          isAuthenticated={isAuthenticated}
        />

        <SuggestionFilters
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {showNewSuggestionForm && (
          <NewSuggestionForm
            newSuggestion={newSuggestion}
            onCancel={() => setShowNewSuggestionForm(false)}
            onSubmit={handleAddSuggestion}
            onChange={handleSuggestionChange}
          />
        )}

        <SortButtons 
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <SuggestionsList
          suggestions={filteredSuggestions}
          userVotes={userVotes}
          onVote={handleVote}
          isLoading={isLoading}
          canVote={canVote}
          isAuthenticated={isAuthenticated}
          isOwnSuggestion={isOwnSuggestion}
        />
      </div>
    </div>
  );
};

export default SuggestionsPage;
