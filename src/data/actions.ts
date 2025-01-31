import {
  MessageSquare,
  Sparkles,
  PenTool,
  Brain,
  FileEdit,
  Image
} from "lucide-react"
import type { Action } from "@/types/actions"

export const actions: Action[] = [
  {
    title: "Chat pédagogique",
    route: "/chat",
    icon: MessageSquare,
  },
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
    title: "Différenciation pédagogique",
    route: "/differenciation",
    icon: Brain,
  },
  {
    title: "Assistant administratif",
    route: "/correspondence",
    icon: FileEdit,
  },
  {
    title: "Générer une image",
    route: "/image-generation",
    icon: Image,
    isNew: true
  }
]