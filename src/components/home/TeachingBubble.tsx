
import React, { useState, useEffect } from 'react'
import { MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TeachingStep {
  id: number
  title: string
  description: string
  position: 'left' | 'right'
}

const teachingSteps: TeachingStep[] = [
  {
    id: 1,
    title: "Générateur de séquences",
    description: "Créez des séquences pédagogiques complètes en quelques clics, adaptées à votre programme en cours et à vos élèves, sans y passer des heures.",
    position: 'left'
  },
  {
    id: 2,
    title: "Générer / Différencier des exercices",
    description: "Générez puis adaptez instantanément vos exercices au niveau de chaque élève !",
    position: 'right'
  },
  {
    id: 3,
    title: "Assistant administratif",
    description: "Gagnez un temps précieux en générant automatiquement vos courriers, rapports et documents administratifs tout en conservant un ton professionnel.",
    position: 'left'
  },
  {
    id: 4,
    title: "Générateur d'images",
    description: "Rendez vos supports de cours plus attractifs grâce à des illustrations sur-mesure.",
    position: 'right'
  },
  {
    id: 5,
    title: "Historique de mon contenu",
    description: "Retrouvez facilement tout le contenu que vous avez créé dans les les outils, pour réutiliser et adapter vos supports pédagogiques.",
    position: 'left'
  },
  {
    id: 6,
    title: "Paramètres du profil",
    description: "Personnalisez votre profil, gérez vos préférences et accédez à tous les paramètres de votre compte.",
    position: 'right'
  }
]

export const TeachingBubble = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (hasSeenTutorial) {
      setIsVisible(false)
    }
  }, [])

  const handleSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true')
    setIsVisible(false)
  }

  if (!isVisible || currentStep >= teachingSteps.length) return null

  const step = teachingSteps[currentStep]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`fixed z-50 ${
              step.position === 'left' 
                ? 'left-4' 
                : 'right-4'
            } top-1/2 transform -translate-y-1/2 animate-fade-in`}
          >
            <div className="relative">
              <div className="bg-primary text-white p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{step.title}</span>
                  <span className="text-sm ml-auto">
                    {currentStep + 1}/{teachingSteps.length}
                  </span>
                </div>
                <p className="text-sm mb-4">{step.description}</p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSkip}
                      className="px-3 py-1 text-sm hover:bg-white/10 rounded-md transition-colors"
                    >
                      Passer
                    </button>
                    {currentStep < teachingSteps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        onClick={handleSkip}
                        className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(teachingSteps.length - 1, prev + 1))}
                    disabled={currentStep === teachingSteps.length - 1}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div 
                className={`absolute w-4 h-4 bg-primary transform rotate-45 ${
                  step.position === 'left' 
                    ? '-right-2 top-1/2 -translate-y-1/2' 
                    : '-left-2 top-1/2 -translate-y-1/2'
                }`}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cliquez pour interagir avec le tutoriel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
