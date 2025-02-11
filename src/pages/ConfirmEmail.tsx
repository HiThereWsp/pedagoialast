
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function ConfirmEmail() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyOTP = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get("token_hash");
        const typeParam = searchParams.get("type");
        const type = typeParam as "signup" | "email" | "magiclink" | "invite" | "recovery";

        if (!token || !type) {
          toast({
            variant: "destructive",
            title: "Lien invalide",
            description: "Le lien de confirmation est invalide ou a expiré.",
          });
          navigate("/login");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type,
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur de confirmation",
            description: "Une erreur est survenue lors de la confirmation de votre email.",
          });
          navigate("/login");
          return;
        }

        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session) {
          toast({
            title: "Email confirmé",
            description: "Votre email a été confirmé avec succès.",
          });
          navigate("/home");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur inattendue est survenue.",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyOTP();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}
