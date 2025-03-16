
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info, Mail, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

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
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
            Email utilisateur
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="utilisateur@exemple.fr"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="adminKey" className="text-sm font-medium text-muted-foreground">
            Clé admin
          </label>
          <Input
            id="adminKey"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Clé secrète admin"
          />
        </div>

        {results && (
          <Alert variant={results.diagnosticInfo?.userFound ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Résultat du diagnostic</AlertTitle>
            <AlertDescription className="mt-2">
              {results.diagnosticInfo?.userFound ? (
                <div className="space-y-2">
                  <p><strong>Utilisateur trouvé:</strong> {results.email}</p>
                  <p><strong>Identités:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.diagnosticInfo.hasFacebookIdentity && (
                      <li>Facebook <CheckCircle2 className="inline h-4 w-4 text-green-600" /></li>
                    )}
                    {results.diagnosticInfo.hasGoogleIdentity && (
                      <li>Google <CheckCircle2 className="inline h-4 w-4 text-green-600" /></li>
                    )}
                    {results.diagnosticInfo.hasEmailIdentity && (
                      <li>Email/Mot de passe <CheckCircle2 className="inline h-4 w-4 text-green-600" /></li>
                    )}
                    {!results.diagnosticInfo.hasFacebookIdentity && 
                     !results.diagnosticInfo.hasGoogleIdentity && 
                     !results.diagnosticInfo.hasEmailIdentity && (
                      <li>Aucune identité complète détectée</li>
                    )}
                  </ul>
                  
                  {results.diagnosticInfo?.subscription && (
                    <div className="bg-green-50 p-2 rounded border border-green-200 mt-2">
                      <CheckCircle2 className="inline h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-800">
                        Abonnement <strong>{results.diagnosticInfo.subscription.type}</strong> actif 
                        jusqu'au {new Date(results.diagnosticInfo.subscription.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                    <Info className="inline h-4 w-4 text-amber-600 mr-1" />
                    <span className="text-amber-800">
                      {results.diagnosticInfo.recommendation}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p>Aucun utilisateur trouvé avec cet email.</p>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                    <Info className="inline h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-blue-800">
                      {results.diagnosticInfo?.recommendation}
                    </span>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert variant="info" className="bg-blue-50">
          <Mail className="h-4 w-4" />
          <AlertTitle>Conseil important</AlertTitle>
          <AlertDescription>
            Si un utilisateur ne reçoit pas le lien magique ou l'email de réinitialisation, 
            recommandez-lui de vérifier son dossier spam/indésirables. Certains fournisseurs 
            de messagerie peuvent bloquer nos emails.
          </AlertDescription>
        </Alert>
        
        <Alert variant="warning" className="bg-amber-50">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Attribution d'accès beta</AlertTitle>
          <AlertDescription>
            L'accès beta est désormais attribué manuellement uniquement aux utilisateurs sélectionnés.
            Les nouveaux utilisateurs reçoivent par défaut un accès d'essai de 3 jours.
            L'attribution d'un accès beta prolonge l'accès pendant un an.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={diagnoseUser} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? "Diagnostic en cours..." : "Diagnostiquer"}
        </Button>
        
        {results && (
          <>
            <Button
              variant="outline"
              onClick={sendMagicLink}
              disabled={sendingInvite}
              className="w-full"
            >
              {sendingInvite ? "Envoi en cours..." : "Envoyer un lien magique"}
            </Button>
            
            <Button
              variant="secondary"
              onClick={assignBetaAccess}
              disabled={assigningBeta}
              className="w-full"
            >
              {assigningBeta ? "Attribution en cours..." : "Attribuer accès beta"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
