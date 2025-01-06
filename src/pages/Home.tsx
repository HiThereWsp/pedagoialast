import { useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ArrowRight
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-coral-400 to-violet-500 bg-clip-text text-transparent">
            Votre assistant pédagogique intelligent
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simplifiez votre travail d'enseignant avec nos outils alimentés par l'intelligence artificielle
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <Card 
              key={index}
              className={`p-6 border ${tool.borderColor} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
              onClick={() => navigate(tool.route)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${tool.bgColor}`}>
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

        {/* Quick Start Section */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-r from-coral-400 to-violet-500 text-white hover:opacity-90 transition-opacity"
          >
            Commencer maintenant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home