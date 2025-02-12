
import { School, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepOneProps {
  onSelect: (type: string) => void
}

export const StepOne = ({ onSelect }: StepOneProps) => {
  const etablissements = ['École primaire', 'Collège', 'Lycée', 'Université', 'Centre de formation']

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">Quel type d'établissement dirigez-vous ?</h2>
      <div className="grid gap-4">
        {etablissements.map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => onSelect(type)}
            className="flex items-center justify-between p-6 h-auto hover:bg-primary/5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <School className="text-primary h-5 w-5" />
              <span>{type}</span>
            </div>
            <ChevronRight className="text-primary h-5 w-5" />
          </Button>
        ))}
      </div>
    </div>
  )
}
