
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
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    canVote
  } = useSuggestions();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <BackButton />
        
        <HeroSection 
          onNewSuggestion={() => setShowNewSuggestionForm(true)}
        />

        <SuggestionFilters
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchTerm}
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
        />
      </div>
    </div>
  );
};

export default SuggestionsPage;
