
import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"
import { LegalCard } from "@/components/legal/LegalCard"

export default function Legal() {
  const legalDocuments = [
    {
      to: "/terms",
      title: "Conditions Générales d'Utilisation"
    },
    {
      to: "/privacy",
      title: "Politique de Confidentialité"
    },
    {
      to: "/delete-account",
      title: "Supprimer mon compte"
    }
  ]

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
          {legalDocuments.map((doc, index) => (
            <LegalCard
              key={index}
              to={doc.to}
              title={doc.title}
            />
          ))}
        </div>
      </article>
    </div>
  )
}
