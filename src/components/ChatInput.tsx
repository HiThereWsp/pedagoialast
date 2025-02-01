import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttachmentType } from '@/types/chat';

interface ChatInputProps {
  onSendMessage: (
    message: string, 
    attachments?: Array<AttachmentType>, 
    useWebSearch?: boolean
  ) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) {
      return;
    }

    try {
      await onSendMessage(message, undefined, isSearchMode);
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessage(textarea.value);
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    toast({
      title: isSearchMode ? "Mode chat standard activé" : "Mode recherche web activé",
      description: isSearchMode 
        ? "Les réponses seront basées sur le contexte de la conversation" 
        : "Les réponses incluront des informations du web",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-4 border-t">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder={isSearchMode ? "Écrivez votre recherche..." : "Écrivez votre message..."}
          className="w-full resize-none overflow-hidden rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 pr-20 max-h-32"
          rows={1}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={toggleSearchMode}
          disabled={isLoading}
        >
          <Globe className={`h-5 w-5 ${isSearchMode ? 'text-orange-600' : 'text-gray-500'}`} />
        </Button>

        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()} 
          className="h-10 w-10"
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
};