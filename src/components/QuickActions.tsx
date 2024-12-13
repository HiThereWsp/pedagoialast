import { Zap } from "lucide-react"

const quickActions = [
  "Créer un exercice",
  "Générer une séquence",
  "Rechercher dans le programme scolaire officiel",
  "Créer une progression",
  "Adapter un exercice",
  "Planifier une séance",
  "Créer un plan de différenciation",
]

export const QuickActions = () => {
  return (
    <div className="mb-8 rounded-lg bg-emerald-50 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Zap className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-semibold">Actions rapides</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <div
            key={action}
            className="cursor-pointer rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-gray-900">{action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}