
import React from 'react';
import { Check } from "lucide-react";

export function ToolsSection() {
  return (
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
  );
}
