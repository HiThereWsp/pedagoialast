import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"

export default function Privacy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Politique de Confidentialité | PedagoIA"
        description="Découvrez comment PedagoIA protège vos données personnelles et respecte votre vie privée."
      />
      
      <BackButton fallbackPath="/legal" />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8 text-left">Politique de Confidentialité - PedagoIA</h1>
        <p className="text-sm text-muted-foreground mb-8 text-left">Dernière mise à jour : 1er février 2025</p>

        <h2 className="text-2xl font-semibold mt-8 text-left">Introduction</h2>
        <p className="text-left">PedagoIA est une application dédiée aux enseignants, conçue pour simplifier et optimiser leur travail quotidien grâce à l'intelligence artificielle. La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique de confidentialité détaille notre engagement envers la protection de votre vie privée, en conformité avec le Règlement Général sur la Protection des Données (RGPD) et les lois européennes applicables.</p>

        <h2 className="text-2xl font-semibold mt-8 text-left">1. Données que nous collectons</h2>
        <h3 className="text-xl font-medium mt-4 text-left">1.1 Données d'inscription et de profil</h3>
        <p className="text-left">Nous collectons uniquement les informations nécessaires à la fourniture de nos services :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Votre adresse email professionnelle ou personnelle</li>
          <li>Votre prénom</li>
          <li>Votre niveau d'enseignement</li>
          <li>Vos matières enseignées</li>
          <li>Vos préférences de personnalisation</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">1.2 Données d'utilisation</h3>
        <p className="text-left">Pour améliorer votre expérience, nous enregistrons :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Vos interactions avec nos outils pédagogiques</li>
          <li>Les contenus que vous générez (progressions, exercices, évaluations)</li>
          <li>Vos préférences d'utilisation</li>
          <li>Les conversations avec notre assistant pédagogique</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">1.3 Données techniques</h3>
        <p className="text-left">Nous collectons certaines données techniques pour assurer le bon fonctionnement du service :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Adresse IP</li>
          <li>Type de navigateur</li>
          <li>Système d'exploitation</li>
          <li>Données de connexion</li>
          <li>Cookies techniques essentiels</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">2. Utilisation de vos données</h2>
        <h3 className="text-xl font-medium mt-4 text-left">2.1 Objectifs principaux</h3>
        <p className="text-left">Nous utilisons vos données exclusivement pour :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Fournir et personnaliser nos services pédagogiques</li>
          <li>Améliorer la pertinence de nos suggestions</li>
          <li>Assurer la sécurité de votre compte</li>
          <li>Vous communiquer des informations importantes sur le service</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">2.2 Base légale</h3>
        <p className="text-left">Nos traitements reposent sur :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>L'exécution du contrat qui nous lie</li>
          <li>Votre consentement explicite</li>
          <li>Nos intérêts légitimes (amélioration du service, sécurité)</li>
          <li>Nos obligations légales</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">3. Protection et stockage des données</h2>
        <h3 className="text-xl font-medium mt-4 text-left">3.1 Sécurité</h3>
        <p className="text-left">Nous mettons en œuvre des mesures de sécurité robustes :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Hébergement sécurisé en France</li>
          <li>Chiffrement des données en transit et au repos</li>
          <li>Contrôles d'accès stricts</li>
          <li>Surveillance continue de la sécurité</li>
          <li>Sauvegardes régulières chiffrées</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">3.2 Durée de conservation</h3>
        <p className="text-left">Nous conservons vos données :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Pendant la durée de votre utilisation active du service</li>
          <li>12 mois après votre dernière connexion</li>
          <li>Jusqu'à votre demande de suppression</li>
          <li>Selon nos obligations légales pour certaines données</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">4. Vos droits</h2>
        <p className="text-left">En tant qu'utilisateur, vous disposez des droits suivants :</p>
        <h3 className="text-xl font-medium mt-4 text-left">4.1 Droits d'accès et de contrôle</h3>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Accéder à vos données personnelles</li>
          <li>Rectifier vos informations</li>
          <li>Supprimer votre compte et vos données</li>
          <li>Exporter vos données (portabilité)</li>
          <li>Limiter le traitement de vos données</li>
          <li>Vous opposer à certains traitements</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">4.2 Exercice de vos droits</h3>
        <p className="text-left">Pour exercer vos droits :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Email : bonjour@pedagoia.fr</li>
          <li>Délai de réponse : 30 jours maximum</li>
          <li>Justificatif d'identité requis pour certaines demandes</li>
          <li>Pour supprimer votre compte et vos données, <a href="/delete-account" className="text-primary hover:underline">cliquez ici</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">5. Partage des données</h2>
        <h3 className="text-xl font-medium mt-4 text-left">5.1 Nos engagements</h3>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Aucune vente de données personnelles</li>
          <li>Aucun partage à des fins commerciales</li>
          <li>Accès strictement limité aux sous-traitants nécessaires</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">5.2 Sous-traitants</h3>
        <p className="text-left">Nos sous-traitants sont :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Notre hébergeur : Supabase (hébergé en Europe, certifié ISO 27001)</li>
          <li>Notre service d'analyse : PostHog (hébergé en Europe, conforme RGPD)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">6. Protection des mineurs</h2>
        <h3 className="text-xl font-medium mt-4 text-left">6.1 Notre approche</h3>
        <p className="text-left">Service réservé aux enseignants majeurs</p>
        <p className="text-left">Aucune collecte de données d'élèves</p>
        <p className="text-left">Protection renforcée des contenus pédagogiques</p>

        <h3 className="text-xl font-medium mt-4 text-left">6.2 Garanties spécifiques</h3>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Stockage séparé des ressources pédagogiques</li>
          <li>Anonymisation systématique des exemples</li>
          <li>Modération des contenus partagés</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 text-left">7. Modifications et contact</h2>
        <h3 className="text-xl font-medium mt-4 text-left">7.1 Évolution de la politique</h3>
        <p className="text-left">Nous nous réservons le droit de modifier cette politique en vous informant :</p>
        <ul className="list-disc pl-5 mb-4 text-left">
          <li>Par email</li>
          <li>30 jours avant l'application des changements</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 text-left">7.2 Contact</h3>
        <p className="text-left">Pour toute question :</p>
        <p className="text-left">DPO et Support : bonjour@pedagoia.fr</p>

        <h3 className="text-xl font-medium mt-4 text-left">7.3 Autorité de contrôle</h3>
        <p className="text-left">Vous pouvez contacter la CNIL :</p>
        <p className="text-left">www.cnil.fr</p>
        <p className="text-left">3 Place de Fontenoy, 75007 Paris</p>
      </article>
    </div>
  )
}
