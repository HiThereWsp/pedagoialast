import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChevronUp, ChevronDown, Search, Plus, Wand2 } from 'lucide-react';

const initialSuggestions = [
  {
    id: "eval-1",
    title: "Assistant de correction",
    description: "Un outil intelligent pour vous aider à corriger les travaux des élèves avec des commentaires personnalisés et des suggestions d'amélioration.",
    votes: 0,
    status: 'créé',
    author: "Marie L.",
    date: "2024-03-15"
  },
  {
    id: "comm-1",
    title: "Générateur de messages pour les parents",
    description: "Créez facilement des messages personnalisés pour communiquer avec les parents d'élèves sur les progrès, les difficultés ou les événements à venir.",
    votes: 0,
    status: 'créé',
    author: "Claire F.",
    date: "2024-03-14"
  },
  {
    id: "report-1",
    title: "Assistant pour les comptes-rendus",
    description: "Générez rapidement des comptes-rendus détaillés pour les conseils de classe, les réunions pédagogiques ou les entretiens avec les parents.",
    votes: 0,
    status: 'créé',
    author: "Thomas R.",
    date: "2024-03-13"
  },
  {
    id: "agenda-1",
    title: "Cahier de textes numérique",
    description: "Un cahier de textes digital pour gérer les devoirs, les leçons et le suivi des programmes de manière efficace et collaborative.",
    votes: 0,
    status: 'créé',
    author: "Sophie M.",
    date: "2024-03-12"
  },
  {
    id: "plan-1",
    title: "Planificateur de classe quotidien",
    description: "Organisez votre journée de classe avec un planificateur intelligent qui s'adapte à vos besoins et aux imprévus.",
    votes: 0,
    status: 'créé',
    author: "Pierre D.",
    date: "2024-03-11"
  },
  {
    id: "schedule-1",
    title: "Gestionnaire d'emploi du temps",
    description: "Créez et gérez facilement les emplois du temps de votre classe avec des fonctionnalités de planification avancées.",
    votes: 0,
    status: 'créé',
    author: "Julie B.",
    date: "2024-03-10"
  },
  {
    id: "share-1",
    title: "Partage de ressources",
    description: "Partagez et accédez à des ressources pédagogiques créées par d'autres enseignants de votre établissement.",
    votes: 0,
    status: 'créé',
    author: "Marc V.",
    date: "2024-03-09"
  },
  {
    id: "collab-1",
    title: "Échange avec les collègues",
    description: "Plateforme d'échange et de collaboration entre enseignants pour partager des idées et des bonnes pratiques.",
    votes: 0,
    status: 'créé',
    author: "Anne L.",
    date: "2024-03-08"
  },
  {
    id: "db-1",
    title: "Base de données commune",
    description: "Accédez à une base de données partagée de ressources pédagogiques, exercices et évaluations.",
    votes: 0,
    status: 'créé',
    author: "David P.",
    date: "2024-03-07"
  }
];

export function SuggestionsPage() {
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
          <Card className="p-6 mb-4 bg-white/90 backdrop-blur-md border border-[#FF9633]/10 shadow-lg">
            <div className="space-y-4">
              <Input
                placeholder="Titre de votre suggestion"
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({...newSuggestion, title: e.target.value})}
                className="border-2 focus:border-[#FF9633] transition-all duration-200 rounded-xl"
              />
              <textarea
                placeholder="Description détaillée de votre suggestion..."
                value={newSuggestion.description}
                onChange={(e) => setNewSuggestion({...newSuggestion, description: e.target.value})}
                className="w-full p-4 border-2 rounded-xl h-32 focus:outline-none focus:border-[#FF9633] transition-all duration-200 bg-white resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowNewSuggestionForm(false)}
                  className="hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-xl"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddSuggestion}
                  className="bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-lg rounded-xl"
                  disabled={!newSuggestion.title || !newSuggestion.description}
                >
                  Publier la suggestion
                </Button>
              </div>
            </div>
          </Card>
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
            <Card 
              key={`suggestion-${suggestion.id}`} 
              className={`p-6 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 ${
                suggestion.id.includes('eval') ? 'border-l-4 border-[#B784A7]' :
                suggestion.id.includes('comm') ? 'border-l-4 border-[#77D1F3]' :
                suggestion.id.includes('report') ? 'border-l-4 border-[#9FD984]' :
                suggestion.id.includes('agenda') ? 'border-l-4 border-[#FF9EBC]' :
                'border-l-4 border-[#FFEE7D]'
              }`}
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
                    onClick={() => handleVote(suggestion.id, true)}
                  >
                    <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </Button>
                  <span className="font-bold text-lg text-[#FF9633]">{suggestion.votes}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
                    onClick={() => handleVote(suggestion.id, false)}
                  >
                    <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{suggestion.title}</h3>
                    {suggestion.status === 'complété' && (
                      <span className="px-4 py-1.5 text-xs font-medium bg-[#9FD984]/20 text-[#9FD984] rounded-full border border-[#9FD984]/30">
                        Complété
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">{suggestion.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>{suggestion.author}</span>
                    <span>{suggestion.date}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
