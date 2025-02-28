
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { NewSuggestionForm } from '@/components/suggestions/NewSuggestionForm';
import { SuggestionFilters } from '@/components/suggestions/SuggestionFilters';
import { initialSuggestions } from '@/data/suggestions';
import { BackButton } from '@/components/settings/BackButton';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [sortBy, setSortBy] = useState('votes');
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchUserVotes();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
        return;
      }

      if (data && data.length > 0) {
        setSuggestions(data);
      } else {
        // Si aucune suggestion n'est trouvée, initialisons avec les données par défaut
        await initializeDefaultSuggestions();
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la récupération des votes:', error);
        return;
      }

      if (data) {
        setUserVotes(data.map(vote => vote.suggestion_id));
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  };

  const initializeDefaultSuggestions = async () => {
    try {
      for (const suggestion of initialSuggestions) {
        await supabase.from('suggestions').insert(suggestion);
      }
      // Récupérer les suggestions après initialisation
      const { data } = await supabase
        .from('suggestions')
        .select('*')
        .order('votes', { ascending: false });
      
      if (data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des suggestions:', error);
    }
  };

  const handleVote = async (id: string, increment: boolean) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour voter.",
        variant: "destructive"
      });
      return;
    }

    const voteChange = increment ? 1 : -1;
    
    // Si l'utilisateur essaie d'ajouter un vote
    if (increment) {
      // Vérifier si l'utilisateur a déjà voté pour cette suggestion
      if (userVotes.includes(id)) {
        toast({
          title: "Vote déjà enregistré",
          description: "Vous avez déjà voté pour cette suggestion."
        });
        return;
      }
      
      // Vérifier si l'utilisateur a atteint sa limite de votes
      if (userVotes.length >= 3) {
        toast({
          title: "Limite de votes atteinte",
          description: "Vous ne pouvez voter que pour 3 suggestions maximum.",
          variant: "destructive"
        });
        return;
      }
      
      // Enregistrer le vote
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .insert({ user_id: user.id, suggestion_id: id });
        
      if (voteError) {
        console.error('Erreur lors de l\'ajout du vote:', voteError);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre vote.",
          variant: "destructive"
        });
        return;
      }
      
      // Mettre à jour la liste des votes de l'utilisateur
      setUserVotes([...userVotes, id]);
    } else {
      // Si l'utilisateur retire son vote
      if (!userVotes.includes(id)) {
        toast({
          title: "Aucun vote à retirer",
          description: "Vous n'avez pas voté pour cette suggestion."
        });
        return;
      }
      
      // Supprimer le vote
      const { error: voteError } = await supabase
        .from('suggestion_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('suggestion_id', id);
        
      if (voteError) {
        console.error('Erreur lors de la suppression du vote:', voteError);
        toast({
          title: "Erreur",
          description: "Impossible de retirer votre vote.",
          variant: "destructive"
        });
        return;
      }
      
      // Mettre à jour la liste des votes de l'utilisateur
      setUserVotes(userVotes.filter(v => v !== id));
    }
    
    // Mettre à jour le compteur de votes de la suggestion
    const { error: updateError } = await supabase
      .from('suggestions')
      .update({ votes: suggestions.find(s => s.id === id).votes + voteChange })
      .eq('id', id);
      
    if (updateError) {
      console.error('Erreur lors de la mise à jour des votes:', updateError);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le compteur de votes.",
        variant: "destructive"
      });
      return;
    }
    
    // Mettre à jour l'état local
    setSuggestions(suggestions.map(suggestion =>
      suggestion.id === id
        ? { ...suggestion, votes: suggestion.votes + voteChange }
        : suggestion
    ));
    
    toast({
      title: increment ? "Vote ajouté" : "Vote retiré",
      description: increment 
        ? "Votre vote a été ajouté avec succès." 
        : "Votre vote a été retiré avec succès."
    });
  };

  const handleAddSuggestion = async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour ajouter une suggestion.",
        variant: "destructive"
      });
      return;
    }

    if (newSuggestion.title && newSuggestion.description) {
      const suggestion = {
        id: `suggestion-${Date.now()}`,
        ...newSuggestion,
        votes: 0,
        status: 'créé',
        author: user.email?.split('@')[0] || "Utilisateur",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('suggestions')
        .insert(suggestion);

      if (error) {
        console.error('Erreur lors de l\'ajout de la suggestion:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter votre suggestion.",
          variant: "destructive"
        });
        return;
      }

      setSuggestions([suggestion, ...suggestions]);
      setNewSuggestion({ title: '', description: '' });
      setShowNewSuggestionForm(false);
      
      toast({
        title: "Suggestion ajoutée",
        description: "Votre suggestion a été ajoutée avec succès."
      });
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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
