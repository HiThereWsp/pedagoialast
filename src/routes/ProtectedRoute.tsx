
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      if (!user) {
        try {
          setIsLoading(true);
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error && mounted) {
            toast({
              variant: "destructive",
              title: "Erreur de session",
              description: "Veuillez vous reconnecter.",
            });
          }
        } catch (error) {
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
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [toast, user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  return <>{children}</>;
};
