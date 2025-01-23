import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Array<{ url: string; fileName?: string; fileType?: string }>) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message);
    setMessage('');
    
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGenerateImage}
          disabled={isGeneratingImage || !message.trim()}
          className="flex-shrink-0"
        >
          {isGeneratingImage ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </Button>

        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()} 
          className="flex-shrink-0"
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