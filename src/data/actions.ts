
import {
  Sparkles,
  PenTool,
  FileEdit,
  Image,
  MessageSquare,
  BookOpen
} from "lucide-react"
import type { Action } from "@/types/actions"

export const actions: Action[] = [
  {
    title: "Générateur de séquences",
    route: "/lesson-plan",
    icon: Sparkles,
  },
  {
    title: "Générer / Différencier des exercices",
    route: "/exercise",
    icon: PenTool
  },
  {
    title: "Assistant administratif",
    route: "/correspondence",
    icon: FileEdit,
  },
  {
    title: "Générateur d'images",
    route: "/image-generation",
    icon: Image,
  },
  {
    title: "Historique de mon contenu",
    route: "/saved-content",
    icon: BookOpen,
  },
  {
    title: "Chat",
    route: "/chat",
    icon: MessageSquare,
    maintenanceLabel: "Bientôt disponible"
  }
]
