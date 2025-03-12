
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { NewSuggestionForm } from '@/components/suggestions/NewSuggestionForm';
import { SuggestionFilters } from '@/components/suggestions/SuggestionFilters';
import { BackButton } from '@/components/settings/BackButton';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { useAuth } from "@/hooks/useAuth";

const SuggestionsPage = () => {
  const { user } = useAuth();
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
    setSortBy
  } = useSuggestions();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Bouton retour */}
        <BackButton />
        
        {/* Hero CTA Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Vos suggestions pour améliorer PedagoIA
              </h1>
              <p className="text-base text-gray-600">
                Partagez vos idées pour enrichir notre plateforme éducative.
              </p>
              
              <Button 
                onClick={() => setShowNewSuggestionForm(true)}
                className="w-full md:w-auto bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-sm rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Proposer une idée
              </Button>
            </div>
          </div>
        </div>

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

        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => setSortBy('votes')}
            className={`rounded-lg ${sortBy === 'votes' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
          >
            Plus votées
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSortBy('recent')}
            className={`rounded-lg ${sortBy === 'recent' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
          >
            Plus récentes
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement des suggestions...</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune suggestion trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                {...suggestion}
                onVote={handleVote}
                hasVoted={userVotes.includes(suggestion.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;
