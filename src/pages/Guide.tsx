
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tiles } from "@/components/ui/tiles";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { posthog } from '@/integrations/posthog/client';

const Guide = () => {
  const [searchParams] = useSearchParams();
  
  // Track page view with UTM parameters
  useEffect(() => {
    posthog.capture('guide_page_viewed', {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term')
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours"
        description="Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation tout en créant des contenus plus personnalisés pour vos élèves."
        image="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
        article={true}
      />
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with pattern background */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Tiles rows={50} cols={8} tileSize="md" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-8">
                <img 
                  src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                  alt="PedagoIA Logo" 
                  className="h-24 mx-auto"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight tracking-tight text-[#1a365d]">
                Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation tout en créant des contenus plus personnalisés pour vos élèves.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 group">
                    J'essaie gratuitement
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-md border overflow-hidden relative bg-card/95 backdrop-blur-sm p-8">
                {/* Introduction */}
                <section id="introduction" className="mb-12" itemScope itemType="https://schema.org/Article">
                  <meta itemProp="headline" content="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours" />
                  <meta itemProp="author" content="PedagoIA" />
                  <meta itemProp="datePublished" content="2024-03-19" />
                  <meta itemProp="image" content="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" />
                  
                  <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                    Introduction : Dites adieu à la surcharge de travail
                  </h2>
                  
                  <div itemProp="articleBody">
                    <p className="mb-4">
                      Selon une récente étude du ministère de l'Éducation nationale, les enseignants français consacrent en moyenne <strong>14 heures par semaine</strong> à la préparation de leurs cours et aux tâches administratives. PedagoIA est né d'un constat simple : les enseignants méritent de consacrer plus de temps à l'essentiel - leurs élèves.
                    </p>
                    
                    <blockquote className="bg-gray-50 border-l-4 border-purple-500 p-4 my-6 italic">
                      "PedagoIA m'a permis de réduire de 60% mon temps de préparation tout en créant des contenus plus personnalisés et engageants pour mes élèves." - Marie L., professeure de français
                    </blockquote>
                    
                    <p>
                      Dans ce guide complet, nous vous présentons <strong>l'assistant pédagogique intelligent</strong> qui transforme la manière dont les enseignants français préparent et organisent leurs cours. Découvrez comment <strong>l'intelligence artificielle au service de l'enseignement</strong> peut vous faire gagner un temps précieux tout en enrichissant la qualité de vos supports pédagogiques.
                    </p>
                  </div>
                </section>

                {/* Table des matières */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
                  <h2 className="text-xl font-bold mb-4">Sommaire</h2>
                  <nav aria-label="Table des matières">
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
                  </nav>
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
                    <li>Rendez-vous sur <a href="https://pedagoia.fr" className="text-blue-600 hover:underline">PedagoIA.fr</a></li>
                    <li>Cliquez sur "S'inscrire" en haut à droite</li>
                    <li>Renseignez votre adresse email professionnelle ou personnelle</li>
                    <li>Créez un mot de passe sécurisé</li>
                    <li>Complétez votre profil en indiquant votre prénom, niveau d'enseignement et matières</li>
                  </ol>
                  
                  <p className="mb-4">Une fois inscrit, vous accédez au tableau de bord personnalisé où tous vos outils sont accessibles en un clic.</p>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                    <strong>Temps économisé :</strong> L'inscription ne prend que 2 minutes et vous donne immédiatement accès à tous les outils qui vous feront gagner des heures de travail chaque semaine.
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
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                    <strong>Temps économisé :</strong> Création d'un exercice complet avec corrigé en 30 secondes, contre 20 à 30 minutes en moyenne par exercice traditionnellement.
                  </div>
                </section>

                {/* Générateur d'images */}
                <section id="generateur-images" className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-[#2c3e50] border-b-2 border-gray-100 pb-2">
                    Générateur d'images pédagogiques
                  </h2>
                  
                  <div className="bg-gray-100 rounded-lg p-4 text-center my-6">
                    <p>[Vidéo/GIF montrant la génération d'images]</p>
                  </div>
                  
                  <p className="mb-4">Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong>générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.</p>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                    <strong>Temps économisé :</strong> Création d'une illustration pédagogique en 10 secondes, contre 30 minutes à 1 heure pour chercher ou créer une image adaptée.
                  </div>
                </section>

                {/* FAQ */}
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
                  
                  <p className="mb-6">Prêt à transformer votre pratique enseignante et à redécouvrir le plaisir d'enseigner ?</p>
                  
                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      onClick={() => posthog.capture('guide_cta_clicked')}
                    >
                      Essayer PedagoIA gratuitement pendant 3 jours
                    </Link>
                  </div>
                </section>

                {/* Footer avec mise à jour */}
                <footer className="mt-12 pt-6 border-t border-gray-200 text-gray-600 text-sm italic">
                  <p>Ce guide a été mis à jour le {new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </footer>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Similar to the Bienvenue page */}
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Guide;
