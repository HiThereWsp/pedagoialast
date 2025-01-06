import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wand2 } from 'lucide-react';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { NewSuggestionForm } from '@/components/suggestions/NewSuggestionForm';
import { SuggestionFilters } from '@/components/suggestions/SuggestionFilters';
import { initialSuggestions } from '@/data/suggestions';

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [sortBy, setSortBy] = useState('votes');
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: ''
  });

  const handleVote = (id: string, increment: boolean) => {
    setSuggestions(suggestions.map(suggestion =>
      suggestion.id === id
        ? { ...suggestion, votes: suggestion.votes + (increment ? 1 : -1) }
        : suggestion
    ));
  };

  const handleAddSuggestion = () => {
    if (newSuggestion.title && newSuggestion.description) {
      const suggestion = {
        id: `suggestion-${Date.now()}`,
        ...newSuggestion,
        votes: 0,
        status: 'créé',
        author: "Vous",
        date: new Date().toISOString().split('T')[0]
      };
      setSuggestions([suggestion, ...suggestions]);
      setNewSuggestion({ title: '', description: '' });
      setShowNewSuggestionForm(false);
    }
  };

  const handleSuggestionChange = (field: 'title' | 'description', value: string) => {
    setNewSuggestion(prev => ({ ...prev, [field]: value }));
  };

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(suggestion => 
      selectedStatus === 'tous' || suggestion.status === selectedStatus
    )
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#FF9633] flex items-center gap-3">
            <div className="p-2 bg-[#FF9633]/10 rounded-lg">
              <Wand2 className="w-6 h-6 text-[#FF9633]" />
            </div>
            Suggestions de fonctionnalités
          </h1>
          <Button 
            onClick={() => setShowNewSuggestionForm(true)}
            className="bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-lg rounded-xl px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle suggestion
          </Button>
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
            className={`rounded-xl ${sortBy === 'votes' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
          >
            Plus votées
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSortBy('recent')}
            className={`rounded-xl ${sortBy === 'recent' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
          >
            Plus récentes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              {...suggestion}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuggestionsPage;
