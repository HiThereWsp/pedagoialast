import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Liste des outils disponibles dans l'application
const AVAILABLE_TOOLS = [
  { id: 'plan-de-classe', name: 'Plan de classe' },
  { id: 'sequence', name: 'Générateur de séquences' },
  { id: 'exercice', name: 'Générateur d\'exercices' },
  { id: 'correspondence', name: 'Générateur de correspondances' },
  { id: 'image', name: 'Générateur d\'images' },
  { id: 'general', name: 'Général (toute l\'application)' }
];

interface SuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuggestionDialog = ({ open, onOpenChange }: SuggestionDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [description, setDescription] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const resetForm = () => {
    setDescription('');
    setSelectedTool('');
    setSubmissionError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTool || !description.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const toolInfo = AVAILABLE_TOOLS.find(tool => tool.id === selectedTool);
      
      const suggestion = {
        id: `suggestion-${Date.now()}`,
        title: `Amélioration pour ${toolInfo?.name || selectedTool}`,
        description: description.trim(),
        votes: 0,
        status: 'créé',
        author: user?.email?.split('@')[0] || "Utilisateur",
        created_at: new Date().toISOString(),
        type: 'tool_improvement',
        tool_name: toolInfo?.name || selectedTool
      };

      const { error } = await supabase
        .from('suggestions')
        .insert(suggestion);

      if (error) throw error;
      
      toast({
        title: 'Merci pour votre suggestion !',
        description: 'Votre proposition d\'amélioration a été enregistrée avec succès.',
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la suggestion:', error);
      let errorMessage = 'Une erreur inconnue est survenue';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold leading-tight tracking-tight text-balance">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Suggérer une amélioration
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {submissionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Une erreur est survenue: {submissionError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="tool-selection" className="text-sm font-medium">
              Outil concerné
            </label>
            <Select 
              value={selectedTool} 
              onValueChange={setSelectedTool}
              required
            >
              <SelectTrigger id="tool-selection">
                <SelectValue placeholder="Sélectionner un outil" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TOOLS.map(tool => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="suggestion-description" className="text-sm font-medium">
              Votre suggestion
            </label>
            <Textarea
              id="suggestion-description"
              placeholder="Décrivez votre suggestion d'amélioration en détaillant ce qui pourrait être ajouté ou modifié pour vous aider dans votre travail..."
              className="min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={!selectedTool || !description.trim() || isSubmitting}
              className="mb-2 sm:mb-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la suggestion"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 