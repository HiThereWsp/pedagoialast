import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const quickActions = [
  "Créer un exercice",
  "Générer une séquence",
  "Rechercher dans le programme scolaire officiel",
  "Créer une progression",
  "Adapter un exercice",
  "Planifier une séance",
  "Créer un plan de différenciation",
]

interface QuickActionsProps {
  onActionClick: (action: string) => Promise<void>
  visible: boolean
}

export const QuickActions = ({ onActionClick, visible }: QuickActionsProps) => {
  if (!visible) return null

  return (
    <div className="mb-8 rounded-lg bg-emerald-50/50 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Zap className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <Button
            key={action}
            variant="outline"
            className="h-auto w-full justify-start bg-white px-4 py-3 text-left text-gray-900 hover:bg-gray-50"
            onClick={() => onActionClick(action)}
          >
            <span>{action}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}