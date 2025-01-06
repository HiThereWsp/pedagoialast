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
      bgColor: "bg-[#FFF5F5]",
      borderColor: "border-coral-400/20",
      route: "/chat"
    },
    {
      title: "Générateur de séquences",
      description: "Créez des séquences pédagogiques complètes adaptées à vos besoins",
      icon: Sparkles,
      color: "text-emerald-500",
      bgColor: "bg-[#F0FFF4]",
      borderColor: "border-emerald-500/20",
      route: "/lesson-plan"
    },
    {
      title: "Générateur d'exercices",
      description: "Générez des exercices sur mesure pour vos élèves",
      icon: BookOpen,
      color: "text-violet-500",
      bgColor: "bg-[#FAF5FF]",
      borderColor: "border-violet-500/20",
      route: "/exercise"
    },
    {
      title: "Générateur de correspondances",
      description: "Créez facilement des correspondances avec les parents d'élèves",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-[#EBF8FF]",
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
        {/* Hero Section with Value Proposition */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FEF7CD] to-[#FFDEE2] text-gray-700 mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Votre assistant pédagogique IA</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="block text-gray-900">Gagnez du temps dans</span>
            <span className="bg-gradient-to-r from-coral-400 to-violet-500 bg-clip-text text-transparent">
              la préparation de vos cours
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Créez des contenus pédagogiques de qualité en quelques clics grâce à l'intelligence artificielle
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/chat")}
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Tools Grid with Hover Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {tools.map((tool, index) => (
            <Card 
              key={index}
              className={`group cursor-pointer animate-fade-in hover:shadow-xl transition-all duration-300 overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(tool.route)}
            >
              <div className={`p-8 ${tool.bgColor} border-b-2 ${tool.borderColor}`}>
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl bg-white/80 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`w-8 h-8 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-coral-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${tool.color} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Shortcuts Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Accès rapides</h2>
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