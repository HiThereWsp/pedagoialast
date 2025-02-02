import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"

export default function Legal() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Mentions Légales | PedagoIA"
        description="Découvrez les conditions d'utilisation de PedagoIA, l'assistant qui révolutionne la préparation des cours grâce à l'intelligence artificielle."
      />
      
      <BackButton />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8">Mentions Légales - PedagoIA</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 1er février 2025</p>

        <section id="introduction" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Introduction et Définitions</h2>
          <p>Notre mission chez PedagoIA est de révolutionner l'enseignement grâce à l'intelligence artificielle. En tant qu'assistant pédagogique innovant, nous accompagnons quotidiennement les enseignants dans leur mission éducative. Nos outils intelligents permettent de générer des exercices personnalisés, des plans de cours adaptés et des ressources pédagogiques de qualité.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Termes Clés</h3>
          <p>Une conversation dans PedagoIA désigne tout échange entre l'enseignant et notre assistant IA, permettant de créer des ressources pédagogiques personnalisées. Les exercices différenciés sont des contenus pédagogiques générés automatiquement et adaptés aux différents niveaux des élèves. Les plans de cours sont des documents structurés détaillant les objectifs, le déroulement et les activités d'une séance d'enseignement.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Version Beta et Évolutions</h3>
          <p>En tant que service en version beta, PedagoIA évolue constamment pour mieux répondre aux besoins des enseignants. Nous intégrons régulièrement de nouvelles fonctionnalités basées sur les retours de notre communauté d'utilisateurs. Cette phase nous permet d'optimiser nos outils et d'améliorer continuellement la qualité de nos services.</p>
        </section>

        <section id="services" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Services Proposés</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Assistant Conversationnel</h3>
          <p>Notre assistant pédagogique intelligent engage des conversations naturelles et professionnelles avec les enseignants. Il comprend les besoins spécifiques de chaque situation d'enseignement et propose des solutions adaptées, qu'il s'agisse de créer du contenu pédagogique ou d'optimiser l'organisation de la classe.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Génération d'Exercices</h3>
          <p>PedagoIA excelle dans la création d'exercices différenciés. Notre système analyse le niveau visé, les objectifs pédagogiques et génère automatiquement des exercices pertinents, avec plusieurs niveaux de difficulté pour s'adapter à tous les élèves.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Création de Plans de Cours</h3>
          <p>Notre plateforme assiste les enseignants dans la conception de plans de cours structurés et efficaces. Le système intègre les objectifs du programme officiel, suggère des activités engageantes et propose des évaluations appropriées.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Ressources Pédagogiques</h3>
          <p>PedagoIA génère une variété de ressources pédagogiques : fiches de travail, supports visuels, documents d'évaluation. Chaque ressource est personnalisable et adaptée aux besoins spécifiques de la classe.</p>
        </section>

        <section id="inscription" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Inscription et Compte Utilisateur</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Processus d'Inscription</h3>
          <p>L'inscription à PedagoIA est réservée aux professionnels de l'enseignement. Pour garantir la qualité et la sécurité de notre communauté, nous avons mis en place un processus de vérification rigoureux. L'inscription nécessite une adresse email professionnelle académique ou d'établissement. Cette mesure permet d'assurer que nos services sont utilisés exclusivement par des enseignants qualifiés.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Période d'Essai Gratuite</h3>
          <p>Nous offrons une période d'essai gratuite de 3 jours, permettant aux enseignants de découvrir l'ensemble de nos fonctionnalités sans engagement. Durant cette période, vous bénéficiez d'un accès complet à toutes les fonctionnalités premium de la plateforme. À l'issue de l'essai, vous pouvez choisir librement de poursuivre avec un abonnement ou de mettre fin à votre utilisation.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Sécurité des Données Pédagogiques</h3>
          <p>La sécurité de vos données pédagogiques est notre priorité absolue. Nous mettons en œuvre des mesures de protection avancées, incluant le chiffrement de bout en bout de vos contenus, une authentification renforcée et des sauvegardes régulières. Chaque compte utilisateur bénéficie d'un espace sécurisé personnel pour stocker ses ressources pédagogiques.</p>
        </section>

        <section id="utilisation-ia" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Utilisation de l'Intelligence Artificielle</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Technologies et Modèles</h3>
          <p>PedagoIA utilise des modèles d'intelligence artificielle de dernière génération, notamment OpenAI GPT-4, Google Gemini et Anthropic Claude. Ces modèles sont spécifiquement adaptés aux besoins pédagogiques et sont régulièrement mis à jour pour intégrer les dernières avancées en matière d'IA éducative.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Limites et Transparence</h3>
          <p>Nous sommes transparents concernant les capacités et les limites de nos systèmes d'IA. Les contenus générés, bien que de haute qualité, nécessitent toujours une validation professionnelle par l'enseignant. Notre IA est un outil d'assistance et non de substitution au jugement pédagogique des enseignants.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Conservation et Amélioration</h3>
          <p>Les conversations avec notre assistant sont conservées de manière sécurisée pour permettre la continuité pédagogique et l'amélioration de nos services. Ces données sont anonymisées avant d'être utilisées pour l'entraînement de nos modèles, garantissant ainsi la confidentialité des utilisateurs tout en permettant l'amélioration continue de nos services.</p>
        </section>

        <section id="protection-donnees" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Protection des Données Personnelles</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Infrastructure Sécurisée</h3>
          <p>Toutes les données de PedagoIA sont hébergées exclusivement sur des serveurs situés en Europe, en conformité avec le RGPD. Notre infrastructure utilise des technologies de pointe en matière de sécurité, incluant des pare-feux nouvelle génération et des systèmes de détection d'intrusion.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Traitement des Données</h3>
          <p>Les données pédagogiques sont chiffrées à la fois en transit et au repos. Seules les informations strictement nécessaires au fonctionnement du service sont collectées. Les métriques d'utilisation sont systématiquement anonymisées avant analyse.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Gestion des Documents</h3>
          <p>Les documents uploadés sur notre plateforme sont stockés de manière sécurisée et restent accessibles uniquement à leur propriétaire. Nous appliquons une politique de rétention stricte, avec suppression automatique des documents non utilisés après une période définie.</p>
        </section>

        <section id="contenus-propriete" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Contenus et Propriété Intellectuelle</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Droits sur les Exercices Générés</h3>
          <p>Les exercices générés via PedagoIA sont conçus pour un usage pédagogique exclusif. En tant qu'enseignant utilisateur, vous conservez l'entièreté des droits d'utilisation sur les contenus créés via notre plateforme. Vous pouvez librement modifier, adapter et partager ces ressources dans un cadre éducatif, tout en respectant les droits de propriété intellectuelle des contenus tiers éventuellement utilisés.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Utilisation des Plans de Cours</h3>
          <p>Les plans de cours créés sur PedagoIA demeurent votre propriété intellectuelle exclusive. Notre plateforme vous octroie une licence perpétuelle d'utilisation, de modification et de distribution de ces contenus dans un contexte éducatif. Nous encourageons le partage et la collaboration entre enseignants tout en protégeant vos droits d'auteur.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Images et Ressources Visuelles</h3>
          <p>Les images pédagogiques générées par notre plateforme sont libres de droits pour une utilisation en classe et dans vos supports pédagogiques. Vous pouvez les modifier, les adapter et les intégrer à vos ressources éducatives sans restriction. Nous garantissons que ces images sont générées dans le respect des droits d'auteur et des règles éthiques.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Partage Communautaire</h3>
          <p>Notre communauté d'enseignants peut partager ses ressources via notre plateforme collaborative. Chaque partage est encadré par des conditions claires préservant les droits de l'auteur original tout en permettant l'enrichissement mutuel de la communauté éducative.</p>
        </section>

        <section id="responsabilites" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Responsabilités et Garanties</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Vérification des Contenus</h3>
          <p>Bien que notre IA soit entrainée sur des données éducatives de qualité, nous recommandons systématiquement une vérification humaine des contenus générés. L'enseignant reste le garant de la pertinence pédagogique et de l'adaptation des ressources au niveau de ses élèves.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Limitations de Responsabilité</h3>
          <p>PedagoIA agit comme un outil d'assistance et d'optimisation du travail enseignant. Nous ne pouvons être tenus responsables des décisions pédagogiques prises sur la base des contenus générés. La plateforme garantit néanmoins la qualité technique et la disponibilité optimale de ses services.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Disponibilité du Service</h3>
          <p>En phase beta, nous nous engageons à maintenir une disponibilité maximale du service, avec un objectif de 99,9% de temps de fonctionnement. Les maintenances planifiées sont annoncées à l'avance et programmées aux heures de moindre affluence.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Support Utilisateur Premium</h3>
          <p>Les utilisateurs bénéficient d'un support prioritaire avec des temps de réponse garantis sous 24h ouvrées. Notre équipe d'experts pédagogiques et techniques est disponible pour accompagner chaque enseignant dans l'utilisation optimale de nos outils.</p>
        </section>

        <section id="tarification" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Tarification et Paiement</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Essai Gratuit Sans Engagement</h3>
          <p>La période d'essai gratuite permet de tester l'ensemble des fonctionnalités premium sans aucun engagement. Aucune carte bancaire n'est requise pour démarrer l'essai, garantissant une expérience sans risque pour les nouveaux utilisateurs.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Offres et Abonnements</h3>
          <p>Nos différentes formules d'abonnement sont conçues pour répondre aux besoins variés des enseignants. Les early-adopters bénéficient de tarifs préférentiels garantis à vie. La facturation peut être mensuelle ou annuelle, avec des remises significatives pour les engagements annuels.</p>
        </section>

        <section id="duree-resiliation" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Durée et Résiliation</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Engagement et Flexibilité</h3>
          <p>Nous privilégions la flexibilité dans nos relations avec les enseignants. L'abonnement à PedagoIA fonctionne sans engagement de durée minimale, vous permettant d'adapter votre utilisation à vos besoins réels. Cette approche transparente reflète notre confiance dans la qualité de nos services et notre volonté de mériter continuellement votre confiance.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Exportation des Données</h3>
          <p>En cas de résiliation, nous garantissons l'accès à l'ensemble de vos données pendant une période de 30 jours. Notre outil d'exportation vous permet de récupérer facilement tous vos contenus dans des formats standards et réutilisables (PDF, Word, Excel). Nous nous engageons à faciliter la transition et à préserver l'intégralité de votre travail pédagogique.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Conservation des Conversations</h3>
          <p>Les conversations avec notre assistant pédagogique sont conservées pendant une durée limitée de 12 mois, permettant un suivi optimal de vos projets pédagogiques sur l'année scolaire. Au-delà de cette période, les conversations sont automatiquement archivées et peuvent être supprimées à votre demande.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Procédure de Suppression</h3>
          <p>Sur simple demande de votre part, nous procédons à la suppression définitive de l'ensemble de vos données personnelles et contenus pédagogiques, conformément au RGPD. Cette suppression est irréversible et garantit la confidentialité totale de vos informations.</p>
        </section>

        <section id="dispositions-generales" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Dispositions Générales</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Cadre Juridique</h3>
          <p>PedagoIA opère sous le droit français et européen, garantissant un niveau élevé de protection des données et des droits des utilisateurs. Notre conformité au RGPD et aux réglementations spécifiques au secteur éducatif est régulièrement auditée et mise à jour.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Processus de Médiation</h3>
          <p>En cas de litige, nous privilégions toujours le dialogue et la recherche d'une solution amiable. Un processus de médiation transparent est mis en place, faisant appel à des médiateurs indépendants spécialisés dans le domaine éducatif et numérique.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Évolutions du Service</h3>
          <p>Notre plateforme évolue constamment pour intégrer les dernières innovations pédagogiques et technologiques. Chaque mise à jour majeure est précédée d'une phase de test approfondie et accompagnée d'une documentation claire expliquant les nouvelles fonctionnalités.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Communication des Changements</h3>
          <p>Les modifications importantes des conditions d'utilisation ou des fonctionnalités sont communiquées au minimum 30 jours à l'avance via email et notifications dans l'application. Cette transparence vous permet d'anticiper et de vous adapter aux évolutions du service.</p>
        </section>

        <section id="contact" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Support et Contact</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Assistance Personnalisée</h3>
          <p>Notre équipe de support, composée d'experts en pédagogie et en technologie, est disponible par email à <a href="mailto:bonjour@pedagoia.fr" className="text-primary hover:underline">bonjour@pedagoia.fr</a>. Les abonnés bénéficient d'un accès prioritaire avec des temps de réponse garantis sous 24 heures ouvrées.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Communauté d'Utilisateurs</h3>
          <p>La communauté PedagoIA constitue un espace d'échange privilégié entre enseignants. Vous pouvez y partager vos expériences, découvrir les meilleures pratiques et contribuer à l'amélioration continue de nos outils.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Programme d'Amélioration</h3>
          <p>Nous encourageons activement les suggestions d'amélioration via notre plateforme dédiée. Chaque proposition est étudiée par notre équipe de développement, et les fonctionnalités les plus demandées sont intégrées en priorité dans notre feuille de route.</p>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Ressources et Formation</h3>
          <p>Des ressources pédagogiques, tutoriels et webinaires sont régulièrement proposés pour optimiser votre utilisation de PedagoIA. Ces formations gratuites vous permettent d'exploiter pleinement le potentiel de nos outils et de rester à jour avec les dernières fonctionnalités.</p>
        </section>
      </article>
    </div>
  )
}
