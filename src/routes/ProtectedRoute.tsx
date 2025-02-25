
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            toast({
              variant: "destructive",
              title: "Erreur de session",
              description: "Veuillez vous reconnecter.",
            });
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Une erreur est survenue, veuillez vous reconnecter.",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Utilise le statut d'authentification du hook useAuth
  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  return <>{children}</>;
};
