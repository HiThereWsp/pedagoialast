
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type Redirect = {
  id: string;
  short_path: string;
  target_url: string;
  description: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
};

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRedirect, setEditRedirect] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({
    short_path: "",
    target_url: "",
    description: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user has admin access
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const email = user.email;
      if (email !== "andyguitteaud@gmail.com" && email !== "ag.tradeunion@gmail.com") {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'avez pas accès à cette page."
        });
        navigate("/");
      }
    };

    checkAccess();
  }, [navigate, toast]);

  // Load redirects
  useEffect(() => {
    const fetchRedirects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_url_redirects");
        
        if (error) throw error;
        
        setRedirects(data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les redirections."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRedirects();
  }, [toast]);

  // Handle create/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editRedirect) {
        // Update existing redirect
        const { data, error } = await supabase.rpc("update_url_redirect", {
          p_id: editRedirect.id,
          p_short_path: formData.short_path,
          p_target_url: formData.target_url,
          p_description: formData.description
        });
        
        if (error) throw error;
        
        setRedirects(redirects.map(r => r.id === editRedirect.id ? data : r));
        toast({
          title: "Redirection mise à jour",
          description: `La redirection ${formData.short_path} a été mise à jour.`
        });
      } else {
        // Create new redirect
        const { data, error } = await supabase.rpc("insert_url_redirect", {
          p_short_path: formData.short_path,
          p_target_url: formData.target_url,
          p_description: formData.description
        });
        
        if (error) throw error;
        
        setRedirects([...redirects, data]);
        toast({
          title: "Redirection créée",
          description: `La redirection ${formData.short_path} a été créée.`
        });
      }
      
      setOpenDialog(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue."
      });
    }
  };

  // Delete a redirect
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette redirection ?")) return;
    
    try {
      const { error } = await supabase.rpc("delete_url_redirect", { p_id: id });
      
      if (error) throw error;
      
      setRedirects(redirects.filter(r => r.id !== id));
      toast({
        title: "Redirection supprimée",
        description: "La redirection a été supprimée avec succès."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression."
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      short_path: "",
      target_url: "",
      description: ""
    });
    setEditRedirect(null);
  };

  // Open edit dialog
  const handleEdit = (redirect: Redirect) => {
    setEditRedirect(redirect);
    setFormData({
      short_path: redirect.short_path,
      target_url: redirect.target_url,
      description: redirect.description || ""
    });
    setOpenDialog(true);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  // Get base URL
  const getBaseUrl = () => {
    return window.location.origin;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-5xl font-bold leading-tight tracking-tight text-balance">
            Gestion des Redirections
          </CardTitle>
          <CardDescription>
            Créez et gérez des liens courts pour vos campagnes marketing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            className="mb-4"
          >
            Nouvelle Redirection
          </Button>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chemin court</TableHead>
                    <TableHead>URL cible</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Clics</TableHead>
                    <TableHead>Dernier clic</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redirects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Aucune redirection trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    redirects.map((redirect) => (
                      <TableRow key={redirect.id}>
                        <TableCell>
                          <a 
                            href={`${getBaseUrl()}/${redirect.short_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {redirect.short_path}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          <a 
                            href={redirect.target_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {redirect.target_url}
                          </a>
                        </TableCell>
                        <TableCell>{redirect.description}</TableCell>
                        <TableCell>{redirect.click_count}</TableCell>
                        <TableCell>{formatDate(redirect.last_clicked_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(redirect)}
                            >
                              Modifier
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(redirect.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="short_path">Chemin court</Label>
                <Input
                  id="short_path"
                  placeholder="ex: fb/campaign1"
                  value={formData.short_path}
                  onChange={(e) => setFormData({...formData, short_path: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de cette redirection"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}
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
    </div>
  );
}
