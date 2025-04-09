import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

interface ToolImprovementButtonProps {
  toolName: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const ToolImprovementButton = ({
  toolName,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  className = ''
}: ToolImprovementButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const suggestion = {
        title: `Amélioration pour ${toolName}`,
        description: description,
        votes: 0,
        status: 'créé',
        author: user?.email?.split('@')[0] || "Utilisateur",
        author_id: user?.id,
        created_at: new Date().toISOString(),
        type: 'tool_improvement',
        tool_name: toolName
      };

      const { error } = await supabase
        .from('suggestions')
        .insert(suggestion);

      if (error) throw error;

      toast({
        title: 'Merci pour votre suggestion !',
        description: 'Votre suggestion d\'amélioration a été enregistrée avec succès.',
      });
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la suggestion:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize}
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        Suggérer une amélioration
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suggérer une amélioration pour {toolName}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Décrivez votre suggestion d'amélioration..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 