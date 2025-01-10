import { 
  Compass, 
  BookOpen, 
  PenSquare, 
  FileText, 
  MessageSquare,
} from "lucide-react"
import type { ActionType } from "@/types/actions"

export const actions: ActionType[] = [
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