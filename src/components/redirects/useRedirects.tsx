
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export type Redirect = {
  id: string;
  short_path: string;
  target_url: string;
  description: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
};

export const useRedirects = () => {
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

  // Handle form field changes
  const handleFormChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

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

  return {
    redirects,
    loading,
    openDialog,
    setOpenDialog,
    editRedirect,
    formData,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
  };
};
