
import { Mail, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InfoAlerts() {
  return (
    <>
      <Alert variant="default" className="bg-blue-50">
        <Mail className="h-4 w-4" />
        <AlertTitle>Conseil important</AlertTitle>
        <AlertDescription>
          Si un utilisateur ne reçoit pas le lien magique ou l'email de réinitialisation, 
          recommandez-lui de vérifier son dossier spam/indésirables. Certains fournisseurs 
          de messagerie peuvent bloquer nos emails.
        </AlertDescription>
      </Alert>
      
      <Alert variant="default" className="bg-amber-50">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Attribution d'accès beta</AlertTitle>
        <AlertDescription>
          L'accès beta est désormais attribué manuellement uniquement aux utilisateurs sélectionnés.
          Les nouveaux utilisateurs reçoivent par défaut un accès d'essai de 3 jours.
          L'attribution d'un accès beta prolonge l'accès pendant un an.
        </AlertDescription>
      </Alert>
    </>
  );
}
