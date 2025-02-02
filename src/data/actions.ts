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
    route: "/exercises",
    icon: PenTool,
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
    title: "Chat pédagogique",
    route: "/chat",
    icon: MessageSquare
  }
]