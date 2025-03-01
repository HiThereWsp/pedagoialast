import React from 'react';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";

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
        <section className="relative py-16 md:py-24 overflow-hidden bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block animate-fade-in">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 inline-flex items-center gap-1">
                  Découvrez PedagoIA
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-balance leading-tight tracking-tight">
                L'assistant pédagogique intelligent
              </h1>
              
              <h2 className="text-2xl md:text-3xl mb-12">
                L'IA qui t'aide à <span className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text">planifier</span> en quelques clics
              </h2>
              
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
              >
                J'essaie gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Section Copilote - Image avant le texte et texte rapproché */}
        <section className="container mx-auto px-4 py-16 border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Image placée avant le texte */}
            <div className="w-full mb-8 rounded-lg overflow-hidden">
              <div className="w-full h-64 bg-secondary/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Image placeholder</p>
              </div>
            </div>
            
            {/* Texte rapproché */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">L'IA comme copilote</h2>
              <p className="text-xl text-muted-foreground">
                Des outils conçus pour alléger drastiquement votre charge de travail
              </p>
            </div>
          </div>
        </section>
        
        {/* Section Avant/Après */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-red-100 p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">😞</span>
                    <h3 className="text-2xl font-semibold text-destructive">Sans pedagogIA</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                      <p>Trop de formalités, pas assez de temps</p>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                      <p>Soirées et week-ends passés à travailler</p>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                      <p>Des heures à corriger les copies</p>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                      <p>Pas assez de temps pour s'occuper des élèves</p>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#F2FCE2] p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">😎</span>
                    <h3 className="text-2xl font-semibold text-primary">Avec pedagogIA</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                      <p>Automatisation des tâches répétitives</p>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                      <p>Planification optimisée</p>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                      <p>Des exercices et évaluations en un clic</p>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                      <p>Différentiation pédagogique en un clic</p>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                      <p>L'efficacité de plusieurs outils IA en un seul</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Témoignage Principal */}
        <section className="container mx-auto px-4 py-16 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-lg shadow-premium">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden">
                    <div className="w-full h-full bg-blue-200/60"></div>
                  </div>
                </div>
                <div>
                  <blockquote className="text-xl md:text-2xl mb-4 text-gray-800">
                    « Utiliser pedagoIA au cours de l'année c'est comme avoir un assistant expérimenté disponible partout même en classe ! »
                  </blockquote>
                  <p className="text-gray-600">
                    - Melissa, maîtresse en CM2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section Comment Ça Marche */}
        <HowItWorksSection />
        
        {/* Sections restantes inchangées */}
        <section className="bg-foreground text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-10 overflow-x-auto">
              <div className="flex space-x-8">
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Séquences</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Exercices</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Différentiation</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                  </div>
                  <span className="text-sm text-yellow-500">Évaluation</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Images</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Rédaction</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-2 text-white/40">
                  </div>
                  <span className="text-sm text-white/40">Réclamez vos outils</span>
                </button>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Évaluation</h2>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Création d'évaluations adaptées automatiquement au niveau des élèves</span>
                </li>
                
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Générez des grilles d'évaluation personnalisées en quelques clics</span>
                </li>
                
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Assistance pour l'analyse des résultats et recommandations</span>
                </li>
                
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Export des résultats en formats multiples (PDF, Excel, Pronote)</span>
                </li>
                
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Création de bilans périodiques pour les réunions parents-professeurs</span>
                </li>
                
                <li className="flex items-start text-yellow-500 font-medium">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Temps économisé : 6 heures par semaine</span>
                </li>
                
                <li className="flex items-start text-yellow-500 font-medium">
                  <Check className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Maux de tête : 0</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Section FAQ */}
        <FAQSection />
        
        {/* Section Témoignages */}
        <TestimonialsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Bienvenue;
