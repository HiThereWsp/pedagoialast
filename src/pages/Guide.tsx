import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tiles } from "@/components/ui/tiles";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
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
  return <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO title="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours" description="Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation tout en créant des contenus plus personnalisés pour vos élèves." image="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" article={true} />
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with pattern background */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="absolute inset-0 opacity-25">
            <Tiles rows={50} cols={8} tileSize="md" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-8">
                <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-24 mx-auto" />
              </div>
              
              <h1 className="text-4xl font-bold mb-8 text-balance leading-tight tracking-tight text-[#1a365d] md:text-5xl">Guide Complet PedagoIA 

 L'Assistant IA qui Révolutionne la Préparation des Cours</h1>
              
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
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
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border-0 overflow-hidden relative bg-white backdrop-blur-sm rounded-2xl">
                <CardContent className="p-8 md:p-12">
                  {/* Introduction */}
                  <section id="introduction" className="mb-16" itemScope itemType="https://schema.org/Article">
                    <meta itemProp="headline" content="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours" />
                    <meta itemProp="author" content="PedagoIA" />
                    <meta itemProp="datePublished" content="2024-03-19" />
                    <meta itemProp="image" content="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" />
                    
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Introduction : Dites adieu à la surcharge de travail
                    </h2>
                    
                    <div itemProp="articleBody" className="space-y-6">
                      <p className="text-lg leading-relaxed text-gray-700">
                        Selon une récente étude du ministère de l'Éducation nationale, les enseignants français consacrent en moyenne <strong className="text-[#2c3e50]">14 heures par semaine</strong> à la préparation de leurs cours et aux tâches administratives. PedagoIA est né d'un constat simple : les enseignants méritent de consacrer plus de temps à l'essentiel - leurs élèves.
                      </p>
                      
                      <blockquote className="bg-gray-50 border-l-4 border-purple-500 p-6 my-8 italic text-lg rounded-r-lg shadow-sm">
                        "PedagoIA m'a permis de réduire de 60% mon temps de préparation tout en créant des contenus plus personnalisés et engageants pour mes élèves."
                        <footer className="mt-2 text-gray-600 not-italic text-base">Marie L., professeure de français</footer>
                      </blockquote>
                      
                      <p className="text-lg leading-relaxed text-gray-700">
                        Dans ce guide complet, nous vous présentons <strong className="text-[#2c3e50]">l'assistant pédagogique intelligent</strong> qui transforme la manière dont les enseignants français préparent et organisent leurs cours. Découvrez comment <strong className="text-[#2c3e50]">l'intelligence artificielle au service de l'enseignement</strong> peut vous faire gagner un temps précieux tout en enrichissant la qualité de vos supports pédagogiques.
                      </p>
                    </div>
                  </section>

                  {/* Table des matières */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 mb-16 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-[#2c3e50]">Sommaire</h2>
                    <nav aria-label="Table des matières">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#premiers-pas" className="text-blue-600 hover:underline text-lg">Premiers pas avec PedagoIA</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#generateur-sequences" className="text-blue-600 hover:underline text-lg">Générateur de séquences pédagogiques</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#exercices-evaluations" className="text-blue-600 hover:underline text-lg">Créer des exercices et des évaluations</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#generateur-images" className="text-blue-600 hover:underline text-lg">Générateur d'images pédagogiques</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#correspondances" className="text-blue-600 hover:underline text-lg">Correspondances et communications</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#gestion-ressources" className="text-blue-600 hover:underline text-lg">Gestion de vos ressources</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#astuces" className="text-blue-600 hover:underline text-lg">Astuces pour optimiser votre utilisation</a>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-3 text-purple-500"><Check size={18} /></div>
                          <a href="#faq" className="text-blue-600 hover:underline text-lg">FAQ : Réponses à vos questions</a>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  {/* Premiers pas */}
                  <section id="premiers-pas" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Premiers pas avec PedagoIA
                    </h2>
                    
                    <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#3d4852]">Création de votre compte enseignant</h3>
                    <div className="bg-gray-100 rounded-xl p-6 text-center my-8 shadow-inner">
                      <p className="text-gray-500">[Vidéo/GIF montrant le processus d'inscription]</p>
                    </div>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">PedagoIA est spécialement conçu pour les enseignants français, de la maternelle au lycée. Pour commencer :</p>
                    
                    <ol className="list-none space-y-4 mb-8 pl-0">
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">1</span>
                        <span className="text-lg">Rendez-vous sur <a href="https://pedagoia.fr" className="text-blue-600 hover:underline font-medium">PedagoIA.fr</a></span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">2</span>
                        <span className="text-lg">Cliquez sur "S'inscrire" en haut à droite</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">3</span>
                        <span className="text-lg">Renseignez votre adresse email professionnelle ou personnelle</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">4</span>
                        <span className="text-lg">Créez un mot de passe sécurisé</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">5</span>
                        <span className="text-lg">Complétez votre profil en indiquant votre prénom, niveau d'enseignement et matières</span>
                      </li>
                    </ol>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">Une fois inscrit, vous accédez au tableau de bord personnalisé où tous vos outils sont accessibles en un clic.</p>
                    
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 my-8 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="mr-3 text-green-600 bg-green-100 p-1 rounded-full">
                          <Check size={16} />
                        </div>
                        <h4 className="text-xl font-semibold text-green-800">Temps économisé</h4>
                      </div>
                      <p className="text-lg leading-relaxed text-green-700 pl-8">
                        L'inscription ne prend que 2 minutes et vous donne immédiatement accès à tous les outils qui vous feront gagner des heures de travail chaque semaine.
                      </p>
                    </div>
                  </section>

                  {/* Générateur de séquences */}
                  <section id="generateur-sequences" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Générateur de séquences pédagogiques
                    </h2>
                    
                    <div className="bg-gray-100 rounded-xl p-6 text-center my-8 shadow-inner">
                      <p className="text-gray-500">[Vidéo/GIF montrant la création d'une séquence]</p>
                    </div>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">
                      L'un des outils les plus appréciés de PedagoIA est le <strong className="text-[#2c3e50]">générateur de séquences pédagogiques</strong> qui vous permet de créer des progressions complètes en quelques clics.
                    </p>
                    
                    <h3 className="text-2xl font-semibold mt-8 mb-6 text-[#3d4852]">Comment créer une séquence pédagogique</h3>
                    
                    <ol className="list-none space-y-4 mb-8 pl-0">
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">1</span>
                        <span className="text-lg">Depuis votre tableau de bord, cliquez sur "Générateur de séquences"</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">2</span>
                        <span className="text-lg">Sélectionnez votre niveau d'enseignement et votre matière</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">3</span>
                        <span className="text-lg">Précisez la thématique de votre séquence</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">4</span>
                        <span className="text-lg">Indiquez le nombre de séances souhaitées et leur durée</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">5</span>
                        <span className="text-lg">Ajoutez des contraintes spécifiques (matériel disponible, approche pédagogique, etc.)</span>
                      </li>
                      <li className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">6</span>
                        <span className="text-lg">Cliquez sur "Générer ma séquence"</span>
                      </li>
                    </ol>
                    
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 my-8 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="mr-3 text-green-600 bg-green-100 p-1 rounded-full">
                          <Check size={16} />
                        </div>
                        <h4 className="text-xl font-semibold text-green-800">Temps économisé</h4>
                      </div>
                      <p className="text-lg leading-relaxed text-green-700 pl-8">
                        Une séquence pédagogique complète générée en moins d'une minute, contre 3 à 5 heures de préparation traditionnelle. Soit une économie moyenne de 4h30 par séquence !
                      </p>
                    </div>
                  </section>

                  {/* Exercices et évaluations */}
                  <section id="exercices-evaluations" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Créer des exercices et des évaluations
                    </h2>
                    
                    <div className="bg-gray-100 rounded-xl p-6 text-center my-8 shadow-inner">
                      <p className="text-gray-500">[Vidéo/GIF montrant la création d'exercices]</p>
                    </div>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">
                      La création d'exercices pertinents et variés est l'une des tâches les plus chronophages pour les enseignants. PedagoIA simplifie ce processus grâce à son <strong className="text-[#2c3e50]">générateur d'exercices intelligent</strong>.
                    </p>
                    
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 my-8 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="mr-3 text-green-600 bg-green-100 p-1 rounded-full">
                          <Check size={16} />
                        </div>
                        <h4 className="text-xl font-semibold text-green-800">Temps économisé</h4>
                      </div>
                      <p className="text-lg leading-relaxed text-green-700 pl-8">
                        Création d'un exercice complet avec corrigé en 30 secondes, contre 20 à 30 minutes en moyenne par exercice traditionnellement.
                      </p>
                    </div>
                  </section>

                  {/* Générateur d'images */}
                  <section id="generateur-images" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Générateur d'images pédagogiques
                    </h2>
                    
                    <div className="bg-gray-100 rounded-xl p-6 text-center my-8 shadow-inner">
                      <p className="text-gray-500">[Vidéo/GIF montrant la génération d'images]</p>
                    </div>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">
                      Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong className="text-[#2c3e50]">générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.
                    </p>
                    
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 my-8 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="mr-3 text-green-600 bg-green-100 p-1 rounded-full">
                          <Check size={16} />
                        </div>
                        <h4 className="text-xl font-semibold text-green-800">Temps économisé</h4>
                      </div>
                      <p className="text-lg leading-relaxed text-green-700 pl-8">
                        Création d'une illustration pédagogique en 10 secondes, contre 30 minutes à 1 heure pour chercher ou créer une image adaptée.
                      </p>
                    </div>
                  </section>

                  {/* FAQ */}
                  <section id="faq" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      FAQ : Réponses à vos questions
                    </h2>
                    
                    {/* FAQ avec schema.org pour SEO */}
                    <div itemScope itemType="https://schema.org/FAQPage" className="space-y-6">
                      
                      <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <h3 itemProp="name" className="text-xl font-semibold mb-4 text-[#3d4852] cursor-pointer hover:text-purple-700 transition-colors">
                          Quelle est la différence entre PedagoIA et d'autres outils pédagogiques numériques ?
                        </h3>
                        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                          <div itemProp="text" className="pl-6 border-l-2 border-purple-200">
                            <p className="text-lg leading-relaxed text-gray-700">
                              Contrairement aux simples banques de ressources ou aux outils de présentation, PedagoIA est un <strong className="text-[#2c3e50]">assistant intelligent</strong> qui comprend les besoins spécifiques des enseignants français. Il ne se contente pas de vous fournir des ressources, il les crée spécifiquement pour vous selon vos besoins, vous permettant d'économiser jusqu'à 60% de votre temps de préparation.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <h3 itemProp="name" className="text-xl font-semibold mb-4 text-[#3d4852] cursor-pointer hover:text-purple-700 transition-colors">
                          Les contenus générés par PedagoIA sont-ils conformes aux programmes officiels ?
                        </h3>
                        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                          <div itemProp="text" className="pl-6 border-l-2 border-purple-200">
                            <p className="text-lg leading-relaxed text-gray-700">
                              PedagoIA s'efforce de produire des contenus en lien avec les programmes officiels de l'Éducation nationale. Cependant, <strong className="text-[#2c3e50]">nous recommandons toujours aux enseignants de vérifier</strong> la conformité des contenus générés avec les programmes en vigueur et d'apporter les ajustements nécessaires. L'IA est régulièrement mise à jour, mais l'expertise pédagogique de l'enseignant reste essentielle.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <h3 itemProp="name" className="text-xl font-semibold mb-4 text-[#3d4852] cursor-pointer hover:text-purple-700 transition-colors">
                          Puis-je essayer PedagoIA gratuitement avant de m'abonner ?
                        </h3>
                        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                          <div itemProp="text" className="pl-6 border-l-2 border-purple-200">
                            <p className="text-lg leading-relaxed text-gray-700">
                              Bien sûr ! PedagoIA propose un <strong className="text-[#2c3e50]">essai gratuit de 3 jours</strong> donnant accès à l'ensemble des fonctionnalités. Aucune carte bancaire n'est requise pour l'essai.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </section>

                  {/* Section conclusion avec CTA */}
                  <section id="conclusion" className="mb-16">
                    <h2 className="text-3xl font-bold mb-6 text-[#2c3e50] border-b border-gray-100 pb-3">
                      Conclusion : Transformez votre façon d'enseigner avec PedagoIA
                    </h2>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">
                      PedagoIA représente une véritable révolution dans la <strong className="text-[#2c3e50]">gestion du temps des enseignants</strong>. En automatisant les tâches chronophages de préparation et d'administration, cet assistant intelligent vous permet de vous recentrer sur l'essentiel : l'accompagnement de vos élèves et la qualité de votre enseignement.
                    </p>
                    
                    <p className="text-lg leading-relaxed text-gray-700 mb-8">Prêt à transformer votre pratique enseignante et à redécouvrir le plaisir d'enseigner ?</p>
                    
                    <div className="text-center bg-purple-50 p-8 rounded-xl border border-purple-100 shadow-sm">
                      <Link to="/login" className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-lg font-medium transition-colors text-lg shadow-md hover:shadow-lg" onClick={() => posthog.capture('guide_cta_clicked')}>
                        Essayer PedagoIA gratuitement pendant 3 jours
                      </Link>
                    </div>
                  </section>

                  {/* Footer avec mise à jour */}
                  <footer className="mt-16 pt-6 border-t border-gray-200 text-gray-600 text-base italic">
                    <p>Ce guide a été mis à jour le {new Date().toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</p>
                  </footer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Similar to the Bienvenue page */}
        <FAQSection />
      </main>
      
      <Footer />
    </div>;
};
export default Guide;