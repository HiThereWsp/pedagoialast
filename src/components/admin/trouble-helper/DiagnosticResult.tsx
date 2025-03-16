
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DiagnosticResultProps {
  results: any;
}

export function DiagnosticResult({ results }: DiagnosticResultProps) {
  if (!results) return null;
  
  return (
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
  );
}
