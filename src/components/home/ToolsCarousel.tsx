import { useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles,
  FileEdit,
  Brain,
  PenTool
} from "lucide-react"
import { ToolCard } from "./ToolCard"

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
    description: "Créez des exercices adaptés au niveau de vos élèves",
    icon: PenTool,
    color: "text-blue-500",
    bgColor: "bg-[#EBF8FF]",
    borderColor: "border-blue-500/20",
    route: "/exercises"
  },
  {
    title: "Différenciation pédagogique",
    description: "Adaptez vos exercices aux besoins spécifiques de vos élèves",
    icon: Brain,
    color: "text-violet-500",
    bgColor: "bg-[#FAF5FF]",
    borderColor: "border-violet-500/20",
    route: "/differenciation"
  },
  {
    title: "Assistant administratif",
    description: "Créez facilement des correspondances avec les parents d'élèves et l'administration",
    icon: FileEdit,
    color: "text-indigo-500",
    bgColor: "bg-[#EEF2FF]",
    borderColor: "border-indigo-500/20",
    route: "/correspondence"
  }
]

export const ToolsCarousel = () => {
  const navigate = useNavigate()

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            className="animate-fade-in transform hover:-translate-y-1 transition-all duration-300" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ToolCard
              {...tool}
              onClick={() => navigate(tool.route)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}