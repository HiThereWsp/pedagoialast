import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"
import { Link } from "react-router-dom"

export default function Legal() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Mentions Légales | PedagoIA"
        description="Découvrez les mentions légales de PedagoIA, incluant nos conditions d'utilisation et notre politique de confidentialité."
      />
      
      <BackButton />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8">Mentions Légales - PedagoIA</h1>
        
        <div className="space-y-6">
          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <Link to="/terms" className="no-underline">
              <h2 className="text-2xl font-semibold mb-4">Conditions Générales d'Utilisation</h2>
              <p className="text-muted-foreground">
                Découvrez les conditions d'utilisation de PedagoIA, l'assistant qui révolutionne la préparation des cours grâce à l'intelligence artificielle.
              </p>
            </Link>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <Link to="/privacy" className="no-underline">
              <h2 className="text-2xl font-semibold mb-4">Politique de Confidentialité</h2>
              <p className="text-muted-foreground">
                Découvrez comment PedagoIA protège vos données personnelles et respecte votre vie privée.
              </p>
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}