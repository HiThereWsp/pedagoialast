import React, { useState, useEffect } from 'react';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Suggestion } from '@/hooks/suggestions/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Filter, Search, Check, Clock, AlertTriangle, PlusCircle, ThumbsUp, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { hasAdminAccess } from '@/hooks/subscription/accessUtils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Statuts disponibles pour les suggestions
const SUGGESTION_STATUSES = [
  { id: 'créé', label: 'Demandée', color: 'bg-blue-100 text-blue-800', icon: <Clock size={16} /> },
  { id: 'à_évaluer', label: 'À évaluer', color: 'bg-purple-100 text-purple-800', icon: <Search size={16} /> },
  { id: 'en_cours', label: 'En cours', color: 'bg-amber-100 text-amber-800', icon: <AlertTriangle size={16} /> },
  { id: 'complété', label: 'Complétée', color: 'bg-green-100 text-green-800', icon: <Check size={16} /> },
  { id: 'rejeté', label: 'Rejetée', color: 'bg-red-100 text-red-800', icon: <AlertTriangle size={16} /> }
];

export default function SuggestionsManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [manualVotes, setManualVotes] = useState<number>(0);
  const [artificialVotes, setArtificialVotes] = useState<number>(0);

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (!user) return;
    
    // Utiliser la fonction hasAdminAccess pour vérifier si l'utilisateur est admin
    if (!hasAdminAccess(user.email)) {
      // Si l'utilisateur n'est pas dans la liste d'emails administrateurs
      const checkDatabaseAdmin = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();
        
        // Si l'utilisateur n'est pas admin dans la base de données non plus
        if (error || !data || data.is_admin !== true) {
          window.location.href = '/bienvenue';
        }
      };
      
      checkDatabaseAdmin();
    }
  }, [user]);
  
  // Charger les suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Traiter les données pour ajouter des propriétés supplémentaires
        const enhancedData = await Promise.all((data || []).map(async (suggestion) => {
          let email = "Anonyme";
          
          if (suggestion.author_id) {
            email = await getUserEmail(suggestion.author_id);
          }
          
          return {
            ...suggestion,
            userEmail: email,
            artificial_votes: 0 // Valeur par défaut temporaire
          };
        }));
        
        setSuggestions(enhancedData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des suggestions:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les suggestions.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [toast]);
  
  // Filtrer les suggestions selon les critères
  useEffect(() => {
    let filtered = [...suggestions];
    
    // Filtre par type d'outil
    if (selectedType !== 'all') {
      filtered = filtered.filter(suggestion => 
        suggestion.type === selectedType || 
        suggestion.tool_name?.toLowerCase().includes(selectedType.toLowerCase())
      );
    }
    
    // Filtre par statut
    if (activeTab !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.status === activeTab);
    }
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(suggestion => 
        suggestion.title.toLowerCase().includes(term) || 
        suggestion.description.toLowerCase().includes(term) ||
        suggestion.author.toLowerCase().includes(term) ||
        (suggestion.tool_name && suggestion.tool_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredSuggestions(filtered);
  }, [suggestions, selectedType, activeTab, searchTerm]);
  
  // Mettre à jour le statut d'une suggestion
  const updateSuggestionStatus = async (suggestionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ status: newStatus })
        .eq('id', suggestionId);
        
      if (error) throw error;
      
      // Mettre à jour l'état local
      setSuggestions(prevSuggestions => 
        prevSuggestions.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, status: newStatus } 
            : suggestion
        )
      );
      
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la suggestion a été mis à jour avec succès.'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut de la suggestion.',
        variant: 'destructive'
      });
    }
  };
  
  // Formatter la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeColor = (status: string) => {
    const statusInfo = SUGGESTION_STATUSES.find(s => s.id === status);
    return statusInfo?.color || 'bg-gray-100 text-gray-800';
  };
  
  // Obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    const statusInfo = SUGGESTION_STATUSES.find(s => s.id === status);
    return statusInfo?.label || status;
  };
  
  // Obtenir le type d'icône pour le type de suggestion
  const getSuggestionTypeIcon = (type?: string, toolName?: string) => {
    if (type === 'tool_improvement') {
      return <Lightbulb className="h-4 w-4 text-amber-500" />;
    }
    return <Lightbulb className="h-4 w-4 text-blue-500" />;
  };

  // Modifiez temporairement la fonction addManualVotes pour éviter d'utiliser artificial_votes
  const addManualVotes = async (suggestionId: string, voteCount: number, isArtificial: boolean) => {
    try {
      // Si c'est un vote artificiel, affichez simplement un message pour l'instant
      if (isArtificial) {
        toast({
          title: "Fonctionnalité en attente",
          description: "Les votes artificiels seront disponibles après la mise à jour de la base de données."
        });
        return;
      }
      
      // Récupérer les votes réels actuels
      const { data: suggestionData, error: fetchError } = await supabase
        .from('suggestions')
        .select('votes')
        .eq('id', suggestionId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculer les nouveaux votes (uniquement votes réels pour l'instant)
      const currentVotes = suggestionData.votes || 0;
      
      // Mettre à jour les votes réels
      const { error } = await supabase
        .from('suggestions')
        .update({ votes: currentVotes + voteCount })
        .eq('id', suggestionId);
        
      if (error) throw error;
      
      // Mettre à jour l'état local
      setSuggestions(prevSuggestions => 
        prevSuggestions.map(suggestion => {
          if (suggestion.id === suggestionId) {
            return {
              ...suggestion,
              votes: currentVotes + voteCount
            };
          }
          return suggestion;
        })
      );
      
      toast({
        title: "Votes ajoutés",
        description: `${voteCount} votes ont été ajoutés.`
      });
      
      // Réinitialiser les valeurs
      setManualVotes(0);
      setArtificialVotes(0);
      setSelectedSuggestion(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de votes:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les votes.",
        variant: "destructive"
      });
    }
  };

  // Ajoutez ou vérifiez cette fonction pour récupérer l'email de l'utilisateur
  const getUserEmail = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_email')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data?.user_email || "Email non disponible";
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'email:', error);
      return "Erreur de récupération";
    }
  };

  return (
    <DashboardWrapper>
      <Helmet>
        <title>Gestion des suggestions | PedagoIA</title>
      </Helmet>
      
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des suggestions</h1>
        
        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Rechercher une suggestion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <SelectValue placeholder="Type de suggestion" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="tool_improvement">Améliorations d'outils</SelectItem>
                <SelectItem value="feature_request">Nouvelles fonctionnalités</SelectItem>
                <SelectItem value="plan-de-classe">Plan de classe</SelectItem>
                <SelectItem value="sequence">Générateur de séquences</SelectItem>
                <SelectItem value="exercice">Générateur d'exercices</SelectItem>
                <SelectItem value="correspondence">Générateur de correspondances</SelectItem>
                <SelectItem value="image">Générateur d'images</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabs pour filtrer par statut */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-6 mb-4 bg-gray-50 p-1 rounded-lg">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Filter size={16} />
              <span>Toutes</span>
            </TabsTrigger>
            {SUGGESTION_STATUSES.map(status => (
              <TabsTrigger 
                key={status.id}
                value={status.id} 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {status.icon}
                <span>{status.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Tableau des suggestions */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="grid gap-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 font-medium">Aucune suggestion trouvée</p>
                  <p className="text-gray-400 text-sm mt-1">Ajustez vos filtres pour voir d'autres résultats</p>
                </div>
              ) : (
                <div className="overflow-x-auto relative">
                  <div className="rounded-lg overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 p-1 absolute inset-0 opacity-50" style={{ backgroundSize: '24px 24px', backgroundImage: 'linear-gradient(to right, #f9fafb 1px, transparent 1px), linear-gradient(to bottom, #f9fafb 1px, transparent 1px)' }}></div>
                    <Table className="relative">
                      <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="py-4 font-semibold text-gray-700">Date</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Type</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Titre</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Auteur</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Email</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700 text-center">Votes</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Statut</TableHead>
                          <TableHead className="py-4 font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSuggestions.map((suggestion) => {
                          const statusInfo = SUGGESTION_STATUSES.find(s => s.id === suggestion.status) || SUGGESTION_STATUSES[0];
                          
                          return (
                            <TableRow 
                              key={suggestion.id} 
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatDate(suggestion.created_at)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getSuggestionTypeIcon(suggestion.type, suggestion.tool_name)}
                                  <span className="text-sm font-medium">
                                    {suggestion.type === 'tool_improvement' 
                                      ? suggestion.tool_name || 'Amélioration' 
                                      : 'Fonctionnalité'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <div className="truncate font-medium" title={suggestion.title}>
                                  {suggestion.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate" title={suggestion.description}>
                                  {suggestion.description?.substring(0, 60)}...
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{suggestion.author}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {suggestion.userEmail || "Non disponible"}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <Badge variant="outline" className="bg-gray-50 font-medium">
                                    {suggestion.votes || 0}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-gray-100"
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                    title="Ajouter des votes manuellement"
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusInfo.color} font-medium flex items-center gap-1.5 px-2.5 py-1`}>
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={suggestion.status}
                                  onValueChange={(value) => updateSuggestionStatus(suggestion.id, value)}
                                >
                                  <SelectTrigger className="w-[130px] border-gray-200">
                                    <SelectValue placeholder="Modifier statut" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SUGGESTION_STATUSES.map((status) => (
                                      <SelectItem key={status.id} value={status.id} className="flex items-center gap-2">
                                        {status.icon}
                                        <span>{status.label}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue pour ajouter des votes manuels */}
      <Dialog open={!!selectedSuggestion} onOpenChange={(open) => !open && setSelectedSuggestion(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des votes manuels</DialogTitle>
            <DialogDescription>
              {selectedSuggestion?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="manualVotes" className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                Votes réels
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="manualVotes"
                  type="number"
                  value={manualVotes}
                  onChange={(e) => setManualVotes(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <Button 
                  variant="outline" 
                  onClick={() => selectedSuggestion && addManualVotes(selectedSuggestion.id, manualVotes, false)}
                  disabled={manualVotes <= 0}
                >
                  Ajouter
                </Button>
              </div>
            </div>
            
            {/* Cette section est uniquement visible pour votre email */}
            {user && hasAdminAccess(user.email) && (
              <div className="flex flex-col space-y-2 border-t pt-4">
                <label htmlFor="artificialVotes" className="text-sm font-medium flex items-center gap-2 text-purple-600">
                  <ThumbsUp className="h-4 w-4" />
                  Votes artificiels (visibles uniquement par vous)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="artificialVotes"
                    type="number"
                    value={artificialVotes}
                    onChange={(e) => setArtificialVotes(parseInt(e.target.value) || 0)}
                    min="0"
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <Button 
                    variant="outline" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => selectedSuggestion && addManualVotes(selectedSuggestion.id, artificialVotes, true)}
                    disabled={artificialVotes <= 0}
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Ces votes ne sont pas visibles par les utilisateurs et sont uniquement pour l'analyse.
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Email: {selectedSuggestion?.userEmail || "Non disponible"}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedSuggestion(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardWrapper>
  );
} 