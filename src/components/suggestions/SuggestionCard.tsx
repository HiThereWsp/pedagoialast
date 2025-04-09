import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ChevronUp, ChevronDown, Clock, Check, MessageCircle, Send, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Comment {
  id: string;
  author: string;
  text: string;
  created_at: string;
}

interface SuggestionCardProps {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  author: string;
  created_at: string;
  onVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  userVoteType?: 'up' | 'down';
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: boolean;
  comments?: Comment[];
}

export const SuggestionCard = ({
  id,
  title,
  description,
  votes,
  status,
  author,
  created_at,
  onVote,
  userVoteType,
  canVote,
  isAuthenticated,
  isOwnSuggestion,
  comments = []
}: SuggestionCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Simplifier le prénom de l'auteur (si c'est une adresse email, prendre la partie avant @)
  const authorFirstName = author.includes('@') ? author.split('@')[0] : author;
  
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };
  
  const getStatusInfo = () => {
    switch(status) {
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

  const getUpvoteButtonClass = () => {
    if (!isAuthenticated) return "text-gray-300 cursor-not-allowed opacity-50";
    if (isOwnSuggestion) return "text-gray-300 cursor-not-allowed opacity-50";
    if (userVoteType === 'up') return "text-white bg-blue-600 hover:bg-blue-700";
    return "text-gray-400 hover:text-blue-600 hover:bg-blue-50";
  };

  const getDownvoteButtonClass = () => {
    if (!isAuthenticated) return "text-gray-300 cursor-not-allowed opacity-50";
    if (isOwnSuggestion) return "text-gray-300 cursor-not-allowed opacity-50";
    if (userVoteType === 'down') return "text-white bg-blue-600 hover:bg-blue-700";
    return "text-gray-400 hover:text-blue-600 hover:bg-blue-50";
  };
  
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    // Ici vous ajouteriez la logique pour envoyer le commentaire
    console.log('Nouveau commentaire:', newComment);
    setNewComment('');
  };

  return (
    <Card className="p-0 bg-white shadow overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 rounded-lg">
      <div className="flex">
        {/* Barre de couleur latérale en fonction du statut */}
        <div className={`w-1.5 ${status === 'complété' ? 'bg-green-500' : status === 'en_cours' ? 'bg-indigo-500' : 'bg-blue-500'}`} />
        
        <div className="flex-1 p-4">
          <div className="flex gap-4">
            {/* Section de votes */}
            <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={userVoteType === 'up' ? 'default' : 'ghost'}
                      size="sm" 
                      className={`p-1 rounded-full transition-all duration-200 ${getUpvoteButtonClass()}`} 
                      onClick={() => onVote(id, 'up')}
                      disabled={!canVote}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {!isAuthenticated ? "Vous devez être connecté pour voter" : 
                     isOwnSuggestion ? "Vous ne pouvez pas voter pour vos propres suggestions" : 
                     userVoteType === 'up' ? "Retirer votre vote" : "Voter pour cette suggestion"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="font-bold text-lg text-blue-600 py-1">{votes}</span>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={userVoteType === 'down' ? 'default' : 'ghost'}
                      size="sm" 
                      className={`p-1 rounded-full transition-all duration-200 ${getDownvoteButtonClass()}`} 
                      onClick={() => onVote(id, 'down')}
                      disabled={!canVote}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {!isAuthenticated ? "Vous devez être connecté pour voter" : 
                     isOwnSuggestion ? "Vous ne pouvez pas voter pour vos propres suggestions" : 
                     userVoteType === 'down' ? "Retirer votre vote" : "Voter contre cette suggestion"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Contenu de la suggestion */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-800 leading-tight">{title}</h3>
                <Badge className={`flex items-center ${statusInfo.color} ml-2`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">{description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">{authorFirstName}</span>
                  {isOwnSuggestion && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Votre suggestion
                    </span>
                  )}
                  <span className="mx-2">•</span>
                  <time dateTime={created_at}>{formatDate(created_at)}</time>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-blue-600 flex items-center gap-1.5 h-7 px-2"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare size={14} />
                  <span>{comments.length} commentaire{comments.length !== 1 ? 's' : ''}</span>
                </Button>
              </div>
              
              {/* Section commentaires */}
              {showComments && (
                <div className="mt-4">
                  <Separator className="my-3" />
                  
                  {/* Liste des commentaires */}
                  {comments.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {comment.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{comment.author}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <time className="text-xs text-gray-500">{formatDate(comment.created_at)}</time>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mb-3">Aucun commentaire pour le moment.</p>
                  )}
                  
                  {/* Formulaire pour ajouter un commentaire */}
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ajoutez un commentaire..."
                        className="min-h-8 text-sm resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 self-end"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        <Send size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
