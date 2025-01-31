import { 
  MessageSquare, 
  FileText, 
  Brain,
  Image
} from "lucide-react"
import type { Action } from "@/types/actions"

export const actions: Action[] = [
  {
    title: "Chat pédagogique",
    icon: MessageSquare,
    route: "/chat",
    isUtilityAction: false
  },
  {
    title: "Générer des images",
    icon: Image,
    route: "/image-generation", 
    isUtilityAction: false
  },
  {
    title: "Créer une séquence",
    icon: FileText,
    route: "/lesson-plan",
    isUtilityAction: false
  },
  {
    title: "Différenciation pédagogique",
    icon: Brain,
    route: "/differenciation",
    isUtilityAction: false
  }
]