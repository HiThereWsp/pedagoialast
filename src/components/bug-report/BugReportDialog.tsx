
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useBugReport } from '@/hooks/bug-report';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useToast } from '@/hooks/use-toast';

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BugReportDialog = ({ open, onOpenChange }: BugReportDialogProps) => {
  const { toast } = useToast();
  const {
    description,
    setDescription,
    captureScreenshot,
    uploadScreenshot,
    screenshot,
    isCapturing,
    isUploading,
    isSubmitting,
    submitReport,
    resetForm,
  } = useBugReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitReport();
      
      toast({
        title: "Rapport envoyé",
        description: "Merci ! Votre rapport de bug a bien été transmis à notre équipe.",
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du rapport. Veuillez réessayer.",
      });
      console.error('Erreur lors de la soumission du rapport:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold leading-tight tracking-tight text-balance">
            Signaler un problème
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="bug-description" className="text-sm font-medium">
              Description du problème
            </label>
            <Textarea
              id="bug-description"
              placeholder="Décrivez le problème rencontré..."
              className="min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Capture d'écran</label>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={captureScreenshot}
                  disabled={isCapturing || isSubmitting}
                >
                  {isCapturing ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Capturer l'écran
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={uploadScreenshot}
                  disabled={isUploading || isSubmitting}
                >
                  {isUploading ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importer une image
                    </>
                  )}
                </Button>
              </div>
              
              {screenshot && (
                <div className="relative mt-2 overflow-hidden rounded-md border border-muted">
                  <img 
                    src={typeof screenshot === 'string' ? screenshot : URL.createObjectURL(screenshot)} 
                    alt="Capture d'écran" 
                    className="max-h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
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
              disabled={!description || isSubmitting}
              className="mb-2 sm:mb-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le rapport"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
