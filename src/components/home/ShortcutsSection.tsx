import { useNavigate } from "react-router-dom"
import { Settings, Lightbulb } from "lucide-react"
import { ShortcutCard } from "./ShortcutCard"

const shortcuts = [
  {
    title: "Paramètres",
    description: "Gérez votre profil et vos préférences",
    icon: Settings,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    route: "/settings"
  },
  {
    title: "Suggestions",
    description: "Proposez de nouvelles fonctionnalités",
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    route: "/suggestions"
  }
]

export const ShortcutsSection = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Accès rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
            <ShortcutCard
              {...shortcut}
              onClick={() => navigate(shortcut.route)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}