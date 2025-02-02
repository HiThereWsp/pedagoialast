import { Home, MessageSquare, BookOpen, PenTool, Image, Wrench, FileSpreadsheet } from "lucide-react"

export const actions = [
  {
    title: "Chat avec PedagoIA",
    description: "Discutez avec notre assistant pédagogique",
    icon: MessageSquare,
    route: "/chat",
    isNew: true,
    maintenanceLabel: null // Removing the maintenance label to enable the chat
  },
  {
    title: "Générateur de cours",
    description: "Créez des plans de cours détaillés",
    icon: BookOpen,
    route: "/lesson-plan",
    maintenanceLabel: "Bientôt disponible"
  },
  {
    title: "Générateur d'exercices",
    description: "Créez des exercices différenciés",
    icon: PenTool,
    route: "/exercise",
    maintenanceLabel: "Bientôt disponible"
  },
  {
    title: "Générateur d'images",
    description: "Créez des images pour vos cours",
    icon: Image,
    route: "/image-generation",
    maintenanceLabel: "Bientôt disponible"
  },
  {
    isUtilityAction: true,
    title: "Outils",
    description: "Accédez à tous les outils",
    icon: Wrench,
    route: "/tools"
  },
  {
    title: "Métriques",
    description: "Consultez vos statistiques d'utilisation",
    icon: FileSpreadsheet,
    route: "/metrics",
    maintenanceLabel: "Bientôt disponible"
  }
]