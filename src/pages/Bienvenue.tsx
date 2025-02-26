
import React from 'react';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Clock, BookOpen, Zap, UserPlus, Star } from "lucide-react";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

const Bienvenue = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Pedago.ia - L'IA au service des enseignants" 
        description="Libérez du temps. Enseignez pleinement. Pedago.ia vous aide à reprendre le contrôle sur votre temps."
      />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance mb-6">
                <span className="block mb-2">Pedago.ia</span>
                <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                  L'IA au service des enseignants
                </span>
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground/90">
                Libérez du temps. <span className="underline decoration-dashed underline-offset-4">Enseignez pleinement</span>.
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                L'enseignement est une vocation. Mais entre la paperasse, les corrections et la planification, 
                il reste trop peu de place pour l'essentiel : transmettre, accompagner, inspirer. 
                Pedago.ia vous aide à reprendre le contrôle sur votre temps.
              </p>
              
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Avant/Après Section */}
        <section className="py-20 md:py-28 bg-[#F2FCE2]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
                Simplifiez votre <span className="rotate-1 inline-block">quotidien</span> d'enseignant
              </h2>
              
              <div className="mb-8 text-xl text-center">
                Avant / Après : Un seul outil, deux colonnes pour plus de clarté
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-10">
                {/* Colonne Avant */}
                <Card className="shadow-premium border-0 overflow-hidden transform transition-all hover:-translate-y-1">
                  <div className="bg-destructive/10 py-3 text-center font-semibold text-lg border-b">
                    Avant
                  </div>
                  <CardContent className="pt-6">
                    <ul className="space-y-5">
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                        <span>Trop de formalités, pas assez de temps</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                        <span>Soirées et week-ends passés à travailler</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                        <span>Des heures à corriger les copies</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                        <span>Une classe hétérogène, pas assez de temps</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Colonne Après */}
                <Card className="shadow-premium border-0 overflow-hidden transform transition-all hover:-translate-y-1">
                  <div className="bg-primary/10 py-3 text-center font-semibold text-lg border-b">
                    Avec Pedago.ia
                  </div>
                  <CardContent className="pt-6">
                    <ul className="space-y-5">
                      <li className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                        <span>Automatisation des tâches répétitives</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                        <span>Planification optimisée</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                        <span>Assistance à la correction et génération d'exercices</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                        <span>Adaptation simplifiée des contenus</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
                Les fonctionnalités clés qui <span className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text">changent tout</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                <Card className="shadow-premium hover:shadow-premium-lg transition-all duration-300 border-0 p-6 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Gagnez du temps</h3>
                    <p className="text-muted-foreground">
                      Génération automatique de plans de cours, exercices et différenciation pédagogique en quelques secondes.
                    </p>
                  </div>
                </Card>
                
                <Card className="shadow-premium hover:shadow-premium-lg transition-all duration-300 border-0 p-6 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Des ressources de qualité</h3>
                    <p className="text-muted-foreground">
                      Des séquences pédagogiques adaptées à vos besoins et aux niveaux de vos élèves.
                    </p>
                  </div>
                </Card>
                
                <Card className="shadow-premium hover:shadow-premium-lg transition-all duration-300 border-0 p-6 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Assistance intelligente</h3>
                    <p className="text-muted-foreground">
                      Un assistant qui vous aide à rédiger vos documents administratifs et à optimiser votre organisation.
                    </p>
                  </div>
                </Card>
                
                <Card className="shadow-premium hover:shadow-premium-lg transition-all duration-300 border-0 p-6 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Pensé pour les enseignants</h3>
                    <p className="text-muted-foreground">
                      Conçu avec et pour la communauté éducative afin de répondre aux vrais défis du métier.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section Témoignages */}
        <TestimonialsSection />
        
        {/* Section CTA finale */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Essayez Pedago.ia gratuitement dès aujourd'hui
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Découvrez comment Pedago.ia peut transformer votre quotidien d'enseignant.
              </p>
              
              <div className="flex flex-col items-center gap-8 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Aucun engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Accès immédiat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Expérience optimisée</span>
                  </div>
                </div>
                
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-10 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Bienvenue;
