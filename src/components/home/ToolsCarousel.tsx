import { useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles,
  FileEdit
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
    description: "Générez des exercices sur mesure pour vos élèves",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-[#FAF5FF]",
    borderColor: "border-violet-500/20",
    route: "/exercise"
  },
  {
    title: "Assistant administratif",
    description: "Créez facilement des correspondances avec les parents d'élèves et l'administration",
    icon: FileEdit,
    color: "text-blue-500",
    bgColor: "bg-[#EBF8FF]",
    borderColor: "border-blue-500/20",
    route: "/correspondence"
  }
]

export const ToolsCarousel = () => {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            className="animate-fade-in" 
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