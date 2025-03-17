
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

// Ne plus importer le composant ToolCard puisqu'il ne sera plus utilisé
// import { ToolCard } from "./ToolCard"

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

  // Comme nous n'avons plus besoin d'afficher ce composant, retournons simplement null
  return null;
}
