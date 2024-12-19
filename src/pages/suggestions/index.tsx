import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Wand2 } from "lucide-react"
import { SuggestionCard } from "@/components/suggestions/SuggestionCard"
import { NewSuggestionForm } from "@/components/suggestions/NewSuggestionForm"
import { Suggestion } from "@/types/suggestion"
import { initialSuggestions } from './data'

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('tous')
  const [sortBy, setSortBy] = useState('votes')
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false)

  const handleVote = (id: string, increment: boolean) => {
    setSuggestions(suggestions.map(suggestion =>
      suggestion.id === id
        ? { ...suggestion, votes: suggestion.votes + (increment ? 1 : -1) }
        : suggestion
    ))
  }

  const handleAddSuggestion = (title: string, description: string) => {
    const suggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      title,
      description,
      votes: 0,
      status: 'créé',
      author: "Vous",
      date: new Date().toISOString().split('T')[0]
    }
    setSuggestions([suggestion, ...suggestions])
    setShowNewSuggestionForm(false)
  }

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(suggestion => 
      selectedStatus === 'tous' || suggestion.status === selectedStatus
    )
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

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

        <div className="flex gap-4 flex-col md:flex-row bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg border border-[#FF9633]/10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une suggestion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-[#FF9633] transition-all duration-200 bg-white rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedStatus('tous')}
              className={`rounded-xl ${selectedStatus === 'tous' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
            >
              Toutes
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedStatus('créé')}
              className={`rounded-xl ${selectedStatus === 'créé' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
            >
              En cours
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedStatus('complété')}
              className={`rounded-xl ${selectedStatus === 'complété' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
            >
              Complétées
            </Button>
          </div>
        </div>

        {showNewSuggestionForm && (
          <NewSuggestionForm
            onSubmit={handleAddSuggestion}
            onCancel={() => setShowNewSuggestionForm(false)}
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
              suggestion={suggestion}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </div>
  )
}