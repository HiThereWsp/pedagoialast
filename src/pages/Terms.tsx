import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"

export default function Terms() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Conditions Générales d'Utilisation | PedagoIA"
        description="Découvrez les conditions d'utilisation de PedagoIA, l'assistant qui révolutionne la préparation des cours grâce à l'intelligence artificielle."
      />
      
      <BackButton />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8">Conditions Générales d'Utilisation - PedagoIA</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 1er février 2025</p>

        <section id="introduction" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Introduction</h2>
          <p>Ces conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme PedagoIA. En utilisant nos services, vous acceptez ces conditions dans leur intégralité.</p>
        </section>

        <section id="services" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Services Proposés</h2>
          <p>PedagoIA propose des outils d'assistance pédagogique basés sur l'intelligence artificielle, permettant aux enseignants de créer des ressources éducatives personnalisées.</p>
        </section>

        <section id="inscription" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Inscription et Compte Utilisateur</h2>
          <p>Pour accéder à nos services, vous devez créer un compte utilisateur. Vous vous engagez à fournir des informations exactes et à les maintenir à jour.</p>
        </section>

        <section id="responsabilites" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Responsabilités de l'Utilisateur</h2>
          <p>Vous êtes responsable de l'utilisation de votre compte et de la confidentialité de vos informations d'identification. Vous vous engagez à informer immédiatement PedagoIA de toute utilisation non autorisée de votre compte.</p>
        </section>

        <section id="protection-donnees" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Protection des Données Personnelles</h2>
          <p>Nous nous engageons à protéger vos données personnelles conformément à notre politique de confidentialité. Vous pouvez consulter notre politique pour plus d'informations sur la manière dont nous collectons et utilisons vos données.</p>
        </section>

        <section id="modifications" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Modifications des CGU</h2>
          <p>PedagoIA se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications par email ou via la plateforme.</p>
        </section>

        <section id="contact" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Contact</h2>
          <p>Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse suivante : <a href="mailto:bonjour@pedagoia.fr" className="text-primary hover:underline">bonjour@pedagoia.fr</a>.</p>
        </section>
      </article>
    </div>
  )
}
