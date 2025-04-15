import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { Helmet } from 'react-helmet-async';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChevronUp, Send, Clock, Check, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Comment } from '@/hooks/suggestions/types';

export default function SuggestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  const {
    suggestions,
    userVotes,
    comments,
    addComment,
    handleVote,
    isLoading,
    canVote,
    isAuthenticated,
    isOwnSuggestion
  } = useSuggestions();

  // Trouver la suggestion par ID
  const suggestion = suggestions.find(s => s.id === id);
  const suggestionComments = id ? (comments[id] || []) : [];
  const userVoteType = id ? userVotes[id] : undefined;
  const isVoted = userVoteType === 'up';

  if (isLoading) {
    return (
      <DashboardWrapper>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (!suggestion) {
    return (
      <DashboardWrapper>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Card className="p-8 text-center">
            <h1 className="text-xl font-semibold mb-4">Suggestion introuvable</h1>
            <p className="text-gray-600">Cette suggestion n'existe pas ou a été supprimée.</p>
          </Card>
        </div>
      </DashboardWrapper>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusInfo = () => {
    switch(suggestion.status) {
      case 'en_cours':
        return {
          label: 'En cours',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: <MessageCircle size={14} className="mr-1" />
        };
      case 'complété':
        return {
          label: 'Complétée',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Check size={14} className="mr-1" />
        };
      default:
        return {
          label: 'Demandée',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Clock size={14} className="mr-1" />
        };
    }
  };

  const statusInfo = getStatusInfo();
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id) return;
    
    const comment = await addComment(id, newComment);
    if (comment) {
      setNewComment('');
    }
  };

  return (
    <DashboardWrapper>
      <Helmet>
        <title>{suggestion.title} | Suggestions | PedagoIA</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/suggestions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux suggestions
        </Button>
        
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-indigo-100 text-indigo-700 border-none">
                    {suggestion.tool_name || 'Fonctionnalité'}
                  </Badge>
                  <Badge className={`flex items-center ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{suggestion.title}</h1>
                <p className="text-gray-700 mb-4">{suggestion.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">{suggestion.author}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={suggestion.created_at}>
                    {formatDate(suggestion.created_at)}
                  </time>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 rounded-full ${
                    isVoted 
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => canVote && handleVote(suggestion.id, 'up')}
                  disabled={!canVote}
                  title={
                    !isAuthenticated ? "Vous devez être connecté pour voter" : 
                    isOwnSuggestion(suggestion.id) ? "Vous ne pouvez pas voter pour vos propres suggestions" :
                    isVoted ? "Retirer votre vote" : "Voter pour cette suggestion"
                  }
                >
                  <ChevronUp className={`h-5 w-5 ${isVoted ? 'text-indigo-700' : 'text-gray-500'}`} />
                  <span className={`font-semibold ${isVoted ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {suggestion.votes || 0}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Section commentaires */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
              Commentaires ({suggestionComments.length})
            </h2>
            
            {suggestionComments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {suggestionComments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {comment.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comment.author}</div>
                        <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6"></div>
            )}
            
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ajoutez un commentaire..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Button 
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="self-end bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Vous devez être connecté pour ajouter un commentaire</p>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardWrapper>
  );
} 