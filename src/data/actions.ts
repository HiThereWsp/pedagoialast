
import {
  Sparkles,
  PenTool,
  FileEdit,
  Image,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import type { Action } from "@/types/actions"

export const actions: Action[] = [
  {
    title: "Générateur de séquences",
    route: "/lesson-plan",
    icon: Sparkles,
  },
  {
    title: "Générateur d'exercices",
    route: "/exercise",
    icon: PenTool,
  },
  {
    title: "Générer / Différencier des exercices",
    route: "/exercise",
    icon: PenTool,
    isNew: true
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
    isNew: true
  },
  {
    title: "Chat",
    route: "/chat",
    icon: MessageSquare,
    maintenanceLabel: "Bientôt disponible"
  }
]
