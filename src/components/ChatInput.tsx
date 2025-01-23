import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Image as ImageIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Array<{ url: string; fileName?: string; fileType?: string }>) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeOption, setActiveOption] = useState<'image' | 'search' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    if (activeOption === 'image') {
      await handleGenerateImage();
    } else if (activeOption === 'search') {
      // Handle web search
      onSendMessage(message, undefined);
    } else {
      onSendMessage(message);
    }
    
    setMessage('');
    setActiveOption(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleGenerateImage = async () => {
    if (!message.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    try {
      const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
        body: { prompt: message }
      });

      if (imageError) throw imageError;
      if (imageData.error) throw new Error(imageData.error);

      onSendMessage(message, [{ 
        url: imageData.image,
        fileType: 'image/png',
        fileName: 'generated-image.png'
      }]);
      setMessage('');

    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Error generating image",
        description: error.message || "An error occurred while generating the image",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
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

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-white p-4 border-t">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message..."
          className="w-full resize-none overflow-hidden rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 pr-20 max-h-32"
          rows={1}
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {activeOption === 'image' ? (
                <ImageIcon className="h-5 w-5 text-coral-400" />
              ) : activeOption === 'search' ? (
                <Search className="h-5 w-5 text-blue-500" />
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveOption('image')}>
              <ImageIcon 
                className={`mr-2 h-4 w-4 ${activeOption === 'image' ? 'text-coral-400' : 'text-gray-500'}`}
              />
              Générer une image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveOption('search')}>
              <Search 
                className={`mr-2 h-4 w-4 ${activeOption === 'search' ? 'text-blue-500' : 'text-gray-500'}`}
              />
              Recherche web
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()} 
          className="flex-shrink-0"
        >
          {isLoading || isGeneratingImage ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
};