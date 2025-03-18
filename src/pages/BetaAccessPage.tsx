
import { SEO } from "@/components/SEO";
import { BetaAccessVerifier } from "@/components/beta/BetaAccessVerifier";

export default function BetaAccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <SEO 
        title="Validation d'Accès Beta" 
        description="Vérifiez et activez votre accès beta après votre achat" 
      />
      
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Accès Beta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Activez votre accès beta en validant vos informations ci-dessous
          </p>
        </div>
        
        <BetaAccessVerifier />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Si vous rencontrez des difficultés pour activer votre accès, n'hésitez pas à nous contacter.
          </p>
        </div>
      </div>
    </div>
  );
}
