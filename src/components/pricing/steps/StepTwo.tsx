
import { Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepTwoProps {
  onSelect: (size: string) => void
}

export const StepTwo = ({ onSelect }: StepTwoProps) => {
  const tailles = [
    'Moins de 10 enseignants',
    '10 à 25 enseignants',
    '25 à 50 enseignants',
    'Plus de 50 enseignants'
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">Combien d'enseignants compte votre établissement ?</h2>
      <div className="grid gap-4">
        {tailles.map((size) => (
          <Button
            key={size}
            variant="outline"
            onClick={() => onSelect(size)}
            className="flex items-center justify-between p-6 h-auto hover:bg-primary/5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="text-primary h-5 w-5" />
              <span>{size}</span>
            </div>
            <ChevronRight className="text-primary h-5 w-5" />
          </Button>
        ))}
      </div>
    </div>
  )
}
