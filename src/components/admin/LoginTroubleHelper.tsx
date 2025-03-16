
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DiagnosticResult, 
  InfoAlerts, 
  UserForm, 
  ActionButtons 
} from "./trouble-helper";

export function LoginTroubleHelper() {
  const [email, setEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [assigningBeta, setAssigningBeta] = useState(false);

  const diagnoseUser = async () => {
    if (!email || !adminKey) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fix-user-auth", {
        body: { userEmail: email, adminToken: adminKey }
      });

      if (error) {
        console.error("Erreur lors du diagnostic:", error);
        toast.error("Erreur lors du diagnostic: " + error.message);
        return;
      }

      setResults(data);
      
      if (data.success) {
        toast.success("Diagnostic effectué avec succès");
      } else {
        toast.error(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Exception:", err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) return;
    
    setSendingInvite(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        console.error("Erreur d'envoi du lien magique:", error);
        toast.error("Erreur d'envoi: " + error.message);
        return;
      }

      toast.success(
        "Lien magique envoyé à " + email + 
        " (vérifiez aussi les dossiers spam ou indésirables)"
      );
    } catch (err) {
      console.error("Exception:", err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setSendingInvite(false);
    }
  };

  const assignBetaAccess = async () => {
    if (!email || !adminKey) return;
    
    setAssigningBeta(true);
    try {
      const { data, error } = await supabase.functions.invoke("assign-beta-access", {
        body: { userEmail: email, adminToken: adminKey }
      });

      if (error) {
        console.error("Erreur lors de l'attribution d'accès beta:", error);
        toast.error("Erreur: " + error.message);
        return;
      }

      toast.success(data.message || "Accès beta accordé avec succès");
    } catch (err) {
      console.error("Exception:", err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setAssigningBeta(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold leading-tight tracking-tight text-balance">
          Aide à la connexion
        </CardTitle>
        <CardDescription>
          Diagnostiquez et résolvez les problèmes d'authentification des utilisateurs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <UserForm 
          email={email}
          setEmail={setEmail}
          adminKey={adminKey}
          setAdminKey={setAdminKey}
        />

        <DiagnosticResult results={results} />
        
        <InfoAlerts />
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <ActionButtons 
          loading={loading}
          results={results}
          sendingInvite={sendingInvite}
          assigningBeta={assigningBeta}
          onDiagnose={diagnoseUser}
          onSendMagicLink={sendMagicLink}
          onAssignBetaAccess={assignBetaAccess}
        />
      </CardFooter>
    </Card>
  );
}
