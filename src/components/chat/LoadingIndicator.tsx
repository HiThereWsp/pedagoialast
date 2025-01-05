import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

const thinkingSteps = [
  "Consultation des programmes officiels de l'Éducation Nationale...",
  "Analyse du niveau et des objectifs pédagogiques...",
  "Identification des concepts clés à expliquer...",
  "Adaptation de la réponse au contexte éducatif...",
  "Formulation d'une explication pédagogique claire...",
]

export const LoadingIndicator = () => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length)
    }, 2500) // Augmenté à 2.5 secondes pour une meilleure lisibilité

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 mr-auto max-w-[80%]">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Analyse pédagogique en cours...</p>
      </div>
      <p className="text-sm text-muted-foreground/80 animate-fade-in">
        {thinkingSteps[currentStep]}
      </p>
    </div>
  )
}