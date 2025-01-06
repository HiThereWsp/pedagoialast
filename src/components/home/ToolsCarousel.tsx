import { useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles,
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
    title: "Générateur de correspondances",
    description: "Créez facilement des correspondances avec les parents d'élèves",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-[#EBF8FF]",
    borderColor: "border-blue-500/20",
    route: "/correspondence"
  }
]

export const ToolsCarousel = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {tools.map((tool, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
              <ToolCard
                {...tool}
                onClick={() => navigate(tool.route)}
                style={{ animationDelay: `${index * 100}ms` }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  )
}