import { useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ArrowRight,
  Settings,
  Lightbulb,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const Home = () => {
  const navigate = useNavigate()

  const tools = [
    {
      title: "Chat pédagogique",
      description: "Discutez avec votre assistant pour obtenir des conseils et des ressources personnalisées",
      icon: MessageSquare,
      color: "text-coral-400",
      bgColor: "bg-coral-400/10",
      borderColor: "border-coral-400/20",
      route: "/chat"
    },
    {
      title: "Générateur de séquences",
      description: "Créez des séquences pédagogiques complètes adaptées à vos besoins",
      icon: Sparkles,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      route: "/lesson-plan"
    },
    {
      title: "Générateur d'exercices",
      description: "Générez des exercices sur mesure pour vos élèves",
      icon: BookOpen,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      route: "/exercise"
    },
    {
      title: "Générateur de correspondances",
      description: "Créez facilement des correspondances avec les parents d'élèves",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      route: "/correspondence"
    }
  ]

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Animation */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FEF7CD] to-[#FFDEE2] text-gray-700 mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Bienvenue sur PedagoIA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-coral-400 to-violet-500 bg-clip-text text-transparent">
            Votre assistant pédagogique intelligent
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simplifiez votre travail d'enseignant avec nos outils alimentés par l'intelligence artificielle
          </p>
        </div>

        {/* Tools Grid with Hover Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {tools.map((tool, index) => (
            <Card 
              key={index}
              className={`p-6 border ${tool.borderColor} hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(tool.route)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${tool.bgColor} transform group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-coral-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {tool.description}
                  </p>
                  <Button
                    variant="ghost"
                    className={`${tool.color} group-hover:bg-gray-100 transition-colors`}
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Shortcuts Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Raccourcis rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shortcuts.map((shortcut, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${(index + tools.length) * 100}ms` }}
                onClick={() => navigate(shortcut.route)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${shortcut.bgColor} transform group-hover:scale-110 transition-transform duration-300`}>
                    <shortcut.icon className={`w-5 h-5 ${shortcut.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 group-hover:text-coral-400 transition-colors">
                      {shortcut.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {shortcut.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home