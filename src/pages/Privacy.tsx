import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"

export default function Privacy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Politique de Confidentialité | PedagoIA"
        description="Découvrez comment PedagoIA protège vos données personnelles et respecte votre vie privée."
      />
      
      <BackButton />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité - PedagoIA</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 1er février 2025</p>

        <h2 className="text-2xl font-semibold mt-8">Introduction</h2>
        <p>PedagoIA est une application dédiée aux enseignants, conçue pour simplifier et optimiser leur travail quotidien grâce à l'intelligence artificielle. La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique de confidentialité détaille notre engagement envers la protection de votre vie privée, en conformité avec le Règlement Général sur la Protection des Données (RGPD) et les lois européennes applicables.</p>

        <h2 className="text-2xl font-semibold mt-8">1. Données que nous collectons</h2>
        <h3 className="text-xl font-medium mt-4">1.1 Données d'inscription et de profil</h3>
        <p>Nous collectons uniquement les informations nécessaires à la fourniture de nos services :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Votre adresse email professionnelle ou personnelle</li>
          <li>Votre prénom et nom</li>
          <li>Votre niveau d'enseignement</li>
          <li>Vos matières enseignées</li>
          <li>Vos préférences de personnalisation</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">1.2 Données d'utilisation</h3>
        <p>Pour améliorer votre expérience, nous enregistrons :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Vos interactions avec nos outils pédagogiques</li>
          <li>Les contenus que vous générez (progressions, exercices, évaluations)</li>
          <li>Vos préférences d'utilisation</li>
          <li>Les conversations avec notre assistant pédagogique</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">1.3 Données techniques</h3>
        <p>Nous collectons certaines données techniques pour assurer le bon fonctionnement du service :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Adresse IP</li>
          <li>Type de navigateur</li>
          <li>Système d'exploitation</li>
          <li>Données de connexion</li>
          <li>Cookies techniques essentiels</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">2. Utilisation de vos données</h2>
        <h3 className="text-xl font-medium mt-4">2.1 Objectifs principaux</h3>
        <p>Nous utilisons vos données exclusivement pour :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Fournir et personnaliser nos services pédagogiques</li>
          <li>Améliorer la pertinence de nos suggestions</li>
          <li>Assurer la sécurité de votre compte</li>
          <li>Vous communiquer des informations importantes sur le service</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">2.2 Base légale</h3>
        <p>Nos traitements reposent sur :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>L'exécution du contrat qui nous lie</li>
          <li>Votre consentement explicite</li>
          <li>Nos intérêts légitimes (amélioration du service, sécurité)</li>
          <li>Nos obligations légales</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Protection et stockage des données</h2>
        <h3 className="text-xl font-medium mt-4">3.1 Sécurité</h3>
        <p>Nous mettons en œuvre des mesures de sécurité robustes :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Hébergement sécurisé en France</li>
          <li>Chiffrement des données en transit et au repos</li>
          <li>Contrôles d'accès stricts</li>
          <li>Surveillance continue de la sécurité</li>
          <li>Sauvegardes régulières chiffrées</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">3.2 Durée de conservation</h3>
        <p>Nous conservons vos données :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Pendant la durée de votre utilisation active du service</li>
          <li>12 mois après votre dernière connexion</li>
          <li>Jusqu'à votre demande de suppression</li>
          <li>Selon nos obligations légales pour certaines données</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">4. Vos droits</h2>
        <p>En tant qu'utilisateur, vous disposez des droits suivants :</p>
        <h3 className="text-xl font-medium mt-4">4.1 Droits d'accès et de contrôle</h3>
        <ul className="list-disc pl-5 mb-4">
          <li>Accéder à vos données personnelles</li>
          <li>Rectifier vos informations</li>
          <li>Supprimer votre compte et vos données</li>
          <li>Exporter vos données (portabilité)</li>
          <li>Limiter le traitement de vos données</li>
          <li>Vous opposer à certains traitements</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">4.2 Exercice de vos droits</h3>
        <p>Pour exercer vos droits :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Email : bonjour@pedagoia.fr</li>
          <li>Délai de réponse : 30 jours maximum</li>
          <li>Justificatif d'identité requis pour certaines demandes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">5. Partage des données</h2>
        <h3 className="text-xl font-medium mt-4">5.1 Nos engagements</h3>
        <ul className="list-disc pl-5 mb-4">
          <li>Aucune vente de données personnelles</li>
          <li>Aucun partage à des fins commerciales</li>
          <li>Accès strictement limité aux sous-traitants nécessaires</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">5.2 Sous-traitants</h3>
        <p>Nos sous-traitants sont :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Notre hébergeur : Supabase (hébergé en Europe, certifié ISO 27001)</li>
          <li>Notre service d'analyse : PostHog (hébergé en Europe, conforme RGPD)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">6. Protection des mineurs</h2>
        <h3 className="text-xl font-medium mt-4">6.1 Notre approche</h3>
        <p>Service réservé aux enseignants majeurs</p>
        <p>Aucune collecte de données d'élèves</p>
        <p>Protection renforcée des contenus pédagogiques</p>

        <h3 className="text-xl font-medium mt-4">6.2 Garanties spécifiques</h3>
        <ul className="list-disc pl-5 mb-4">
          <li>Stockage séparé des ressources pédagogiques</li>
          <li>Anonymisation systématique des exemples</li>
          <li>Modération des contenus partagés</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">7. Modifications et contact</h2>
        <h3 className="text-xl font-medium mt-4">7.1 Évolution de la politique</h3>
        <p>Nous nous réservons le droit de modifier cette politique en vous informant :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Par email</li>
          <li>30 jours avant l'application des changements</li>
        </ul>

        <h3 className="text-xl font-medium mt-4">7.2 Contact</h3>
        <p>Pour toute question :</p>
        <p>DPO et Support : bonjour@pedagoia.fr</p>

        <h3 className="text-xl font-medium mt-4">7.3 Autorité de contrôle</h3>
        <p>Vous pouvez contacter la CNIL :</p>
        <p>www.cnil.fr</p>
        <p>3 Place de Fontenoy, 75007 Paris</p>
      </article>
    </div>
  )
}