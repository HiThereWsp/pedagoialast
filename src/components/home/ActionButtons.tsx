import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Compass, 
  BookOpen, 
  PenSquare, 
  FileText, 
  MessageSquare,
} from "lucide-react"

const actions = [
  {
    title: "Découvrir l'application",
    route: "/discover",
    icon: Compass,
    isUtilityAction: true
  },
  {
    title: "Chatter avec l'assistant",
    route: "/chat",
    icon: MessageSquare,
    isUtilityAction: false
  },
  {
    title: "Générer une séquence pédagogique",
    route: "/lesson-plan",
    icon: BookOpen
  },
  {
    title: "Générer un exercice",
    route: "/exercises",
    icon: PenSquare
  },
  {
    title: "Rédiger un document administratif",
    route: "/correspondence",
    icon: FileText
  }
]

export const ActionButtons = () => {
  const navigate = useNavigate()
  
  const utilityActions = actions.filter(action => action.isUtilityAction)
  const mainActions = actions.filter(action => !action.isUtilityAction)

  return (
    <div className="w-full space-y-6">
      {utilityActions.slice(0, 1).map((action, index) => {
        const Icon = action.icon
        return (
          <Button
            key={index}
            onClick={() => navigate(action.route)}
            className="w-full h-12 bg-gradient-to-r from-blue-100/60 to-blue-200/60 hover:from-blue-100/80 hover:to-blue-200/80 text-gray-800 rounded-2xl border border-blue-200/50 shadow-sm transition-all duration-300 hover:shadow-md"
            variant="ghost"
          >
            <Icon className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
            <span className="flex-1 text-left">{action.title}</span>
          </Button>
        )}
      )}

      <div className="space-y-4">
        {mainActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              onClick={() => navigate(action.route)}
              className="w-full h-14 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60 hover:from-[#FEF7CD]/80 hover:to-[#FFDEE2]/80 text-gray-800 rounded-2xl border border-[#FEF7CD]/50 shadow-sm transition-all duration-300 hover:shadow-md"
              variant="ghost"
            >
              <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="flex-1 text-left">{action.title}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}