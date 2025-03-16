
import { SEO } from "@/components/SEO";
import { LoginTroubleHelper } from "@/components/admin/LoginTroubleHelper";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AdminTools() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-10">
      <SEO 
        title="Outils d'administration | PedagoIA" 
        description="Outils d'administration pour PedagoIA"
      />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-5xl font-extrabold tracking-tight text-balance">
            Outils d'<span className="underline decoration-dashed underline-offset-4">administration</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Résolution des problèmes d'authentification</h2>
            <p className="text-muted-foreground mb-6">
              Cet outil vous aide à diagnostiquer et résoudre les problèmes d'authentification 
              des utilisateurs. Vous pourrez également leur attribuer un accès beta.
            </p>
            <LoginTroubleHelper />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            <div className="bg-card p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-2">Processus d'attribution d'accès beta</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Inscription de l'utilisateur</strong> : L'utilisateur doit d'abord créer un compte
                  sur la plateforme. Par défaut, il recevra un accès d'essai de 3 jours.
                </li>
                <li>
                  <strong>Vérification de l'email</strong> : Assurez-vous que l'utilisateur a vérifié son 
                  adresse email (vérifiez le statut dans l'outil de diagnostic).
                </li>
                <li>
                  <strong>Attribution manuelle</strong> : Entrez l'email de l'utilisateur et votre
                  clé d'administration, puis cliquez sur "Attribuer accès beta".
                </li>
                <li>
                  <strong>Confirmation</strong> : Confirmez à l'utilisateur que son statut a été 
                  mis à jour vers le statut beta, valable pendant un an.
                </li>
              </ol>
              
              <div className="mt-4 bg-amber-50 p-3 rounded border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Important :</strong> L'utilisateur doit être inscrit et avoir un compte
                  avant de pouvoir lui attribuer un accès beta. S'il ne peut pas se connecter, 
                  envoyez-lui d'abord un lien magique pour l'aider à accéder à son compte.
                </p>
              </div>
              
              <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Problèmes connus :</strong> Si vous rencontrez une erreur indiquant 
                  "subscription_type does not exist" lors de l'attribution d'un accès beta, contactez 
                  l'administrateur de base de données pour ajouter la valeur "beta" à l'énumération 
                  subscription_type dans la base de données.
                </p>
              </div>

              <div className="mt-4 bg-green-50 p-3 rounded border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>Nouvelle politique :</strong> Désormais, les nouveaux utilisateurs reçoivent automatiquement
                  un accès d'essai de 3 jours. Seuls les utilisateurs spécifiquement sélectionnés doivent
                  recevoir un accès beta, qui est attribué manuellement via cet outil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
