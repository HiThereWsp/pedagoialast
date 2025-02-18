
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
  position: {
    top: string
    left?: string
    right?: string
    xOffset?: string // Ajout d'un offset horizontal pour un meilleur positionnement
  }
}

const teachingSteps: TeachingStep[] = [
  {
    id: 1,
    title: "Générateur de séquences",
    description: "Créez des séquences pédagogiques complètes en quelques clics, adaptées à votre programme en cours et à vos élèves, sans y passer des heures.",
    position: {
      top: "27%",
      left: "45%"
    }
  },
  {
    id: 2,
    title: "Générer / Différencier des exercices",
    description: "Générez puis adaptez instantanément vos exercices au niveau de chaque élève !",
    position: {
      top: "42%",
      right: "45%"
    }
  },
  {
    id: 3,
    title: "Assistant administratif",
    description: "Gagnez un temps précieux en générant automatiquement vos courriers, rapports et documents administratifs tout en conservant un ton professionnel.",
    position: {
      top: "57%",
      left: "45%"
    }
  },
  {
    id: 4,
    title: "Générateur d'images",
    description: "Rendez vos supports de cours plus attractifs grâce à des illustrations sur-mesure.",
    position: {
      top: "72%",
      right: "45%"
    }
  },
  {
    id: 5,
    title: "Historique de mon contenu",
    description: "Retrouvez facilement tout le contenu que vous avez créé dans les les outils, pour réutiliser et adapter vos supports pédagogiques.",
    position: {
      top: "87%",
      left: "45%"
    }
  },
  {
    id: 6,
    title: "Paramètres du profil",
    description: "Personnalisez votre profil, gérez vos préférences et accédez à tous les paramètres de votre compte.",
    position: {
      top: "12%",
      right: "12%"
    }
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
            className="fixed z-50 transition-all duration-500"
            style={{
              top: step.position.top,
              left: step.position.left,
              right: step.position.right,
              transform: `translateX(${step.position.xOffset || '0px'})`
            }}
          >
            <div className="relative">
              <div className={`absolute w-4 h-4 bg-[#D3E4FD]/80 transform rotate-45 ${
                step.position.left 
                  ? '-right-2' 
                  : '-left-2'
              } top-1/2 -translate-y-1/2 backdrop-blur-sm z-10`} />
              <div className="bg-[#D3E4FD]/80 text-gray-800 p-4 rounded-lg shadow-lg max-w-xs backdrop-blur-sm relative z-20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{step.title}</span>
                  <span className="text-sm ml-auto">
                    {currentStep + 1}/{teachingSteps.length}
                  </span>
                </div>
                <p className="text-sm mb-4 leading-relaxed">{step.description}</p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="p-2 hover:bg-black/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSkip}
                      className="px-3 py-1 text-sm hover:bg-black/10 rounded-md transition-colors"
                    >
                      Passer
                    </button>
                    {currentStep < teachingSteps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="px-3 py-1 text-sm bg-black/10 hover:bg-black/20 rounded-md transition-colors"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        onClick={handleSkip}
                        className="px-3 py-1 text-sm bg-black/10 hover:bg-black/20 rounded-md transition-colors"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(teachingSteps.length - 1, prev + 1))}
                    disabled={currentStep === teachingSteps.length - 1}
                    className="p-2 hover:bg-black/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
