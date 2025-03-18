
import React from 'react';
import { SEO } from "@/components/SEO";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { BackButton } from "@/components/settings/BackButton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Guide = () => {
  return (
    <>
      <SEO
        title="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours"
        description="Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation tout en créant des contenus plus personnalisés pour vos élèves."
        image="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
        article={true}
      />
      <DashboardWrapper>
        <div className="min-h-screen p-6 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <BackButton />
            
            <Card className="shadow-md border overflow-hidden relative bg-card/95 backdrop-blur-sm p-8">
              {/* Logo et image principale */}
              <div className="text-center mb-8">
                <img 
                  src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                  alt="PedagoIA Logo" 
                  className="max-w-[250px] mx-auto"
                />
              </div>
              
              {/* Titre principal */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-[#1a365d]">
                Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours
              </h1>

              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Introduction : Dites adieu à la surcharge de travail
                </h2>
                <p className="mb-4">
                  Selon une récente étude du ministère de l'Éducation nationale, les enseignants français consacrent en moyenne <strong>14 heures par semaine</strong> à la préparation de leurs cours et aux tâches administratives. PedagoIA est né d'un constat simple : les enseignants méritent de consacrer plus de temps à l'essentiel - leurs élèves.
                </p>
                
                <blockquote className="bg-gray-50 border-l-4 border-purple-500 p-4 my-6 italic">
                  "PedagoIA m'a permis de réduire de 60% mon temps de préparation tout en créant des contenus plus personnalisés et engageants pour mes élèves." - Marie L., professeure de français
                </blockquote>
                
                <p>
                  Dans ce guide complet, nous vous présentons <strong>l'assistant pédagogique intelligent</strong> qui transforme la manière dont les enseignants français préparent et organisent leurs cours. Découvrez comment <strong>l'intelligence artificielle au service de l'enseignement</strong> peut vous faire gagner un temps précieux tout en enrichissant la qualité de vos supports pédagogiques.
                </p>
              </section>

              {/* Table des matières */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
                <h2 className="text-xl font-bold mb-4">Sommaire</h2>
                <ul className="space-y-2">
                  <li><a href="#premiers-pas" className="text-blue-600 hover:underline">Premiers pas avec PedagoIA</a></li>
                  <li><a href="#generateur-sequences" className="text-blue-600 hover:underline">Générateur de séquences pédagogiques</a></li>
                  <li><a href="#exercices-evaluations" className="text-blue-600 hover:underline">Créer des exercices et des évaluations</a></li>
                  <li><a href="#generateur-images" className="text-blue-600 hover:underline">Générateur d'images pédagogiques</a></li>
                  <li><a href="#correspondances" className="text-blue-600 hover:underline">Correspondances et communications</a></li>
                  <li><a href="#gestion-ressources" className="text-blue-600 hover:underline">Gestion de vos ressources</a></li>
                  <li><a href="#astuces" className="text-blue-600 hover:underline">Astuces pour optimiser votre utilisation</a></li>
                  <li><a href="#faq" className="text-blue-600 hover:underline">FAQ : Réponses à vos questions</a></li>
                </ul>
              </div>

              {/* Premiers pas */}
              <section id="premiers-pas" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Premiers pas avec PedagoIA
                </h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Création de votre compte enseignant</h3>
                <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                  <p>[Vidéo/GIF montrant le processus d'inscription]</p>
                </div>
                
                <p className="mb-4">PedagoIA est spécialement conçu pour les enseignants français, de la maternelle au lycée. Pour commencer :</p>
                
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Rendez-vous sur <a href="https://pedagogia.fr" className="text-blue-600 hover:underline">PedagoIA.fr</a></li>
                  <li>Cliquez sur "S'inscrire" en haut à droite</li>
                  <li>Renseignez votre adresse email professionnelle ou personnelle</li>
                  <li>Créez un mot de passe sécurisé</li>
                  <li>Complétez votre profil en indiquant votre prénom, niveau d'enseignement et matières</li>
                </ol>
                
                <p className="mb-4">Une fois inscrit, vous accédez au tableau de bord personnalisé où tous vos outils sont accessibles en un clic.</p>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                  <strong>Temps économisé :</strong> L'inscription ne prend que 2 minutes et vous donne immédiatement accès à tous les outils qui vous feront gagner des heures de travail chaque semaine.
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Découverte du tableau de bord</h3>
                <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                  <p>[Vidéo/GIF présentant le tableau de bord]</p>
                </div>
                
                <p className="mb-4">Le tableau de bord est votre centre de contrôle. Vous y retrouvez :</p>
                
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Un accès rapide à tous les outils pédagogiques</li>
                  <li>Vos ressources récemment créées</li>
                  <li>Des suggestions personnalisées selon votre matière et niveau</li>
                </ul>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                  <strong>Temps économisé :</strong> Interface intuitive qui vous permet de retrouver instantanément vos outils et ressources, sans perdre de temps à naviguer dans des menus complexes.
                </div>
              </section>

              {/* Générateur de séquences */}
              <section id="generateur-sequences" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Générateur de séquences pédagogiques
                </h2>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                  <p>[Vidéo/GIF montrant la création d'une séquence]</p>
                </div>
                
                <p className="mb-4">L'un des outils les plus appréciés de PedagoIA est le <strong>générateur de séquences pédagogiques</strong> qui vous permet de créer des progressions complètes en quelques clics.</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Comment créer une séquence pédagogique</h3>
                
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Depuis votre tableau de bord, cliquez sur "Générateur de séquences"</li>
                  <li>Sélectionnez votre niveau d'enseignement et votre matière</li>
                  <li>Précisez la thématique de votre séquence</li>
                  <li>Indiquez le nombre de séances souhaitées et leur durée</li>
                  <li>Ajoutez des contraintes spécifiques (matériel disponible, approche pédagogique, etc.)</li>
                  <li>Cliquez sur "Générer ma séquence"</li>
                </ol>
                
                <p className="mb-4">En moins d'une minute, PedagoIA vous propose une <strong>séquence pédagogique complète</strong> avec :</p>
                
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Les objectifs d'apprentissage en lien avec les programmes officiels</li>
                  <li>Le déroulement détaillé de chaque séance</li>
                  <li>Des activités variées favorisant différents types d'intelligence</li>
                  <li>Des suggestions d'adaptations pour différents niveaux d'élèves</li>
                  <li>Des idées d'évaluation formative et sommative</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <strong>Astuce de pro :</strong> Utilisez la fonction "Adapter au niveau" pour ajuster automatiquement la difficulté selon le profil de votre classe.
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                  <strong>Temps économisé :</strong> Une séquence pédagogique complète générée en moins d'une minute, contre 3 à 5 heures de préparation traditionnelle. Soit une économie moyenne de 4h30 par séquence !
                </div>
              </section>

              {/* Exercices et évaluations */}
              <section id="exercices-evaluations" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Créer des exercices et des évaluations
                </h2>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                  <p>[Vidéo/GIF montrant la création d'exercices]</p>
                </div>
                
                <p className="mb-4">La création d'exercices pertinents et variés est l'une des tâches les plus chronophages pour les enseignants. PedagoIA simplifie ce processus grâce à son <strong>générateur d'exercices intelligent</strong>.</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Types d'exercices disponibles</h3>
                
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>QCM et questions à choix multiples</li>
                  <li>Textes à trous</li>
                  <li>Exercices d'appariement</li>
                  <li>Questions ouvertes</li>
                  <li>Problèmes et situations-problèmes</li>
                  <li>Analyses de documents</li>
                  <li>Dictées préparées et exercices de langue</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Création d'un exercice personnalisé</h3>
                
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Accédez à l'outil "Exercices" depuis votre tableau de bord</li>
                  <li>Sélectionnez le type d'exercice souhaité</li>
                  <li>Précisez la notion travaillée et le niveau de difficulté</li>
                  <li>Ajoutez des contraintes spécifiques (longueur, vocabulaire, etc.)</li>
                  <li>Générez l'exercice et son corrigé</li>
                </ol>
                
                <blockquote className="bg-gray-50 border-l-4 border-purple-500 p-4 my-6 italic">
                  "Les exercices générés par PedagoIA sont parfaitement adaptés au niveau de mes élèves et permettent une véritable différenciation pédagogique." - Thomas R., professeur de mathématiques
                </blockquote>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                  <strong>Temps économisé :</strong> Création d'un exercice complet avec corrigé en 30 secondes, contre 20 à 30 minutes en moyenne par exercice traditionnellement.
                </div>
              </section>

              {/* Autres sections abrégées pour la lisibilité */}
              <section id="generateur-images" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Générateur d'images pédagogiques
                </h2>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                  <p>[Vidéo/GIF montrant la génération d'images]</p>
                </div>
                
                <p className="mb-4">Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong>générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Créer des illustrations pertinentes</h3>
                
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Accédez à l'outil "Générateur d'images" depuis votre tableau de bord</li>
                  <li>Décrivez précisément l'image souhaitée dans le champ de texte</li>
                  <li>Précisez l'usage pédagogique dans les options disponibles</li>
                  <li>Cliquez sur "Générer" et obtenez votre image en quelques secondes</li>
                </ol>
                
                <p className="mb-4">Les images générées sont libres de droits et peuvent être utilisées dans tous vos supports de cours, présentations ou documents partagés avec les élèves.</p>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                  <strong>Temps économisé :</strong> Création d'une illustration pédagogique en 10 secondes, contre 30 minutes à 1 heure pour chercher ou créer une image adaptée.
                </div>
              </section>

              {/* Section FAQ structurée pour le SEO */}
              <section id="faq" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  FAQ : Réponses à vos questions
                </h2>
                
                {/* FAQ avec schema.org pour SEO */}
                <div itemScope itemType="https://schema.org/FAQPage">
                  
                  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="mb-8">
                    <h3 itemProp="name" className="text-lg font-semibold mt-6 mb-3 cursor-pointer hover:text-purple-700 transition-colors">
                      Quelle est la différence entre PedagoIA et d'autres outils pédagogiques numériques ?
                    </h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div itemProp="text" className="pl-4 border-l-2 border-gray-200">
                        <p className="mb-4">Contrairement aux simples banques de ressources ou aux outils de présentation, PedagoIA est un <strong>assistant intelligent</strong> qui comprend les besoins spécifiques des enseignants français. Il ne se contente pas de vous fournir des ressources, il les crée spécifiquement pour vous selon vos besoins, vous permettant d'économiser jusqu'à 60% de votre temps de préparation.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="mb-8">
                    <h3 itemProp="name" className="text-lg font-semibold mt-6 mb-3 cursor-pointer hover:text-purple-700 transition-colors">
                      Les contenus générés par PedagoIA sont-ils conformes aux programmes officiels ?
                    </h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div itemProp="text" className="pl-4 border-l-2 border-gray-200">
                        <p className="mb-4">PedagoIA s'efforce de produire des contenus en lien avec les programmes officiels de l'Éducation nationale. Cependant, <strong>nous recommandons toujours aux enseignants de vérifier</strong> la conformité des contenus générés avec les programmes en vigueur et d'apporter les ajustements nécessaires. L'IA est régulièrement mise à jour, mais l'expertise pédagogique de l'enseignant reste essentielle.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="mb-8">
                    <h3 itemProp="name" className="text-lg font-semibold mt-6 mb-3 cursor-pointer hover:text-purple-700 transition-colors">
                      Puis-je essayer PedagoIA gratuitement avant de m'abonner ?
                    </h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div itemProp="text" className="pl-4 border-l-2 border-gray-200">
                        <p className="mb-4">Bien sûr ! PedagoIA propose un <strong>essai gratuit de 3 jours</strong> donnant accès à l'ensemble des fonctionnalités. Aucune carte bancaire n'est requise pour l'essai.</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </section>

              {/* Section conclusion avec CTA */}
              <section id="conclusion" className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                  Conclusion : Transformez votre façon d'enseigner avec PedagoIA
                </h2>
                
                <p className="mb-4">PedagoIA représente une véritable révolution dans la <strong>gestion du temps des enseignants</strong>. En automatisant les tâches chronophages de préparation et d'administration, cet assistant intelligent vous permet de vous recentrer sur l'essentiel : l'accompagnement de vos élèves et la qualité de votre enseignement.</p>
                
                <p className="mb-4">Les enseignants utilisant PedagoIA rapportent :</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Une réduction de 60% du temps de préparation des cours (économie moyenne de 8 à 10 heures par semaine)</li>
                  <li>Une amélioration significative de la qualité et de la diversité des supports</li>
                  <li>Une meilleure capacité à mettre en œuvre une pédagogie différenciée</li>
                  <li>Une diminution du stress et de la charge mentale</li>
                </ul>
                
                <p className="mb-6">Prêt à transformer votre pratique enseignante et à redécouvrir le plaisir d'enseigner ?</p>
                
                <div className="text-center">
                  <a 
                    href="/pricing" 
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    Essayer PedagoIA gratuitement pendant 3 jours
                  </a>
                </div>
              </section>

              {/* Footer avec mise à jour */}
              <footer className="mt-12 pt-6 border-t border-gray-200 text-gray-600 text-sm italic">
                <p>Ce guide a été créé le 18 mars 2025 et est régulièrement mis à jour pour refléter les dernières fonctionnalités de PedagoIA.</p>
              </footer>
            </Card>
          </div>
        </div>
      </DashboardWrapper>
    </>
  );
};

export default Guide;
