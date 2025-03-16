
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  loading: boolean;
  results: any;
  sendingInvite: boolean;
  assigningBeta: boolean;
  onDiagnose: () => void;
  onSendMagicLink: () => void;
  onAssignBetaAccess: () => void;
}

export function ActionButtons({
  loading,
  results,
  sendingInvite,
  assigningBeta,
  onDiagnose,
  onSendMagicLink,
  onAssignBetaAccess
}: ActionButtonsProps) {
  return (
    <>
      <Button 
        onClick={onDiagnose} 
        disabled={loading} 
        className="w-full"
      >
        {loading ? "Diagnostic en cours..." : "Diagnostiquer"}
      </Button>
      
      {results && (
        <>
          <Button
            variant="outline"
            onClick={onSendMagicLink}
            disabled={sendingInvite}
            className="w-full"
          >
            {sendingInvite ? "Envoi en cours..." : "Envoyer un lien magique"}
          </Button>
          
          <Button
            variant="secondary"
            onClick={onAssignBetaAccess}
            disabled={assigningBeta}
            className="w-full"
          >
            {assigningBeta ? "Attribution en cours..." : "Attribuer accès beta"}
          </Button>
        </>
      )}
    </>
  );
}
