
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Redirect = {
  id: string;
  short_path: string;
  target_url: string;
  description: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
};

interface RedirectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRedirect: Redirect | null;
  formData: {
    short_path: string;
    target_url: string;
    description: string;
  };
  onFormChange: (key: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

// Get base URL helper
const getBaseUrl = () => {
  return window.location.origin;
};

export const RedirectDialog = ({
  open,
  onOpenChange,
  editRedirect,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}: RedirectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editRedirect ? "Modifier la redirection" : "Créer une redirection"}
          </DialogTitle>
          <DialogDescription>
            {editRedirect 
              ? "Modifiez les détails de la redirection existante" 
              : "Créez une nouvelle redirection pour vos campagnes marketing"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="short_path">Chemin court</Label>
              <Input
                id="short_path"
                placeholder="ex: fb/campaign1"
                value={formData.short_path}
                onChange={(e) => onFormChange("short_path", e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Sera accessible à: {getBaseUrl()}/{formData.short_path}
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="target_url">URL cible</Label>
              <Input
                id="target_url"
                placeholder="https://exemple.com?utm_source=..."
                value={formData.target_url}
                onChange={(e) => onFormChange("target_url", e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de cette redirection"
                value={formData.description}
                onChange={(e) => onFormChange("description", e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editRedirect ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
