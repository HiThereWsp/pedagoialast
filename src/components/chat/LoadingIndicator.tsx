import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

const thinkingSteps = [
  "Analyse de votre demande...",
  "Recherche des informations pertinentes...",
  "Structuration de la réponse...",
  "Vérification de la cohérence...",
  "Formulation de la réponse...",
]

export const LoadingIndicator = () => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length)
    }, 2000) // Change de message toutes les 2 secondes

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 mr-auto max-w-[80%]">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-muted-foreground">En train d'écrire...</p>
      </div>
      <p className="text-sm text-muted-foreground/80 animate-fade-in">
        {thinkingSteps[currentStep]}
      </p>
    </div>
  )
}