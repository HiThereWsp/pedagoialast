import React, { useState } from 'react';
import { BackButton } from '@/components/settings/BackButton';
import { NewSuggestionForm } from '@/components/suggestions/NewSuggestionForm';
import { SuggestionFilters } from '@/components/suggestions/SuggestionFilters';
import { HeroSection } from '@/components/suggestions/HeroSection';
import { SortButtons } from '@/components/suggestions/SortButtons';
import { SuggestionsList } from '@/components/suggestions/SuggestionsList';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Clock, Filter, Search, Flame, CalendarDays, Plus } from 'lucide-react';

const SuggestionsPage = () => {
  const {
    isLoading,
    handleVote,
    handleAddSuggestion,
    handleSuggestionChange,
    filteredSuggestions,
    userVotes,
    comments,
    addComment,
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

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardWrapper>
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(226, 232, 240, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0'
        }}
      />
      
      <Helmet>
        <title>Suggestions | PedagoIA</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto px-4 pb-12 pt-4 relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <a href="/tableaudebord" className="flex items-center hover:opacity-90 transition-opacity">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-24 w-auto"
            />
          </a>
          
          <Button 
            onClick={() => setShowNewSuggestionForm(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white"
            disabled={!isAuthenticated}
          >
            <Plus className="mr-2 h-4 w-4" />
            Suggérer une fonctionnalité
          </Button>
        </div>
        
        {showNewSuggestionForm && (
          <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Suggérer une fonctionnalité</h2>
            <NewSuggestionForm
              newSuggestion={newSuggestion}
              onCancel={() => setShowNewSuggestionForm(false)}
              onSubmit={handleAddSuggestion}
              onChange={handleSuggestionChange}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Filtres</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-2 ${selectedStatus === 'tous' ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedStatus('tous')}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Toutes
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-2 ${selectedStatus === 'créé' ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedStatus('créé')}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Demandées
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-2 ${selectedStatus === 'en_cours' ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedStatus('en_cours')}
                    >
                      <Clock className="mr-2 h-4 text-amber-500" />
                      En cours
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-2 ${selectedStatus === 'complété' ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedStatus('complété')}
                    >
                      <Clock className="mr-2 h-4 w-4 text-green-500" />
                      Complétées
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <Tabs defaultValue="popular" className="w-80">
                <TabsList className="bg-gray-100">
                  <TabsTrigger 
                    value="popular" 
                    onClick={() => setSortBy('votes')}
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-700"
                  >
                    <Flame className="h-4 w-4 mr-2 text-indigo-600" />
                    Les plus demandées
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recent" 
                    onClick={() => setSortBy('recent')}
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-700"
                  >
                    <CalendarDays className="h-4 w-4 mr-2 text-indigo-600" />
                    Les plus récentes
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <SuggestionsList
              suggestions={filteredSuggestions}
              userVotes={userVotes}
              comments={comments}
              onVote={handleVote}
              onComment={addComment}
              isLoading={isLoading}
              canVote={canVote}
              isAuthenticated={isAuthenticated}
              isOwnSuggestion={isOwnSuggestion}
            />
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default SuggestionsPage;
