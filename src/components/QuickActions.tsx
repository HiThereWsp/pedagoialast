import { Zap, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

const quickActions = [
  {
    title: "Créer un exercice",
    prompt: "Je souhaite créer un exercice pour [NIVEAU] sur le thème [THEME]. L'exercice doit durer environ [DUREE] minutes et être adapté à [TYPE_ELEVES]."
  },
  {
    title: "Générer une séquence",
    prompt: "Aide-moi à créer une séquence pédagogique pour [NIVEAU] sur le thème [THEME]. La séquence devrait s'étendre sur [NOMBRE] séances et inclure [COMPETENCES]."
  },
  {
    title: "Rechercher dans le programme scolaire officiel",
    prompt: "Je cherche les références officielles dans le programme scolaire de [NIVEAU] concernant [THEME]. Peux-tu me donner les compétences et connaissances associées ?"
  },
  {
    title: "Créer une progression",
    prompt: "J'ai besoin d'aide pour établir une progression annuelle pour [NIVEAU] en [MATIERE]. Je souhaite particulièrement mettre l'accent sur [COMPETENCES_CLES]."
  },
  {
    title: "Adapter un exercice",
    prompt: "J'ai besoin d'adapter cet exercice : [EXERCICE] pour des élèves de [NIVEAU] ayant [SPECIFICITES]. Peux-tu m'aider à le différencier ?"
  },
  {
    title: "Planifier une séance",
    prompt: "Aide-moi à planifier une séance de [DUREE] minutes pour une classe de [NIVEAU] sur [THEME]. Les objectifs principaux sont [OBJECTIFS]."
  },
  {
    title: "Créer un plan de différenciation",
    prompt: "Je souhaite mettre en place de la différenciation pour [ACTIVITE] en [MATIERE] pour une classe de [NIVEAU]. J'ai identifié [NOMBRE] groupes de niveaux différents."
  },
]

interface QuickActionsProps {
  onActionClick: (action: string) => Promise<void>
  visible: boolean
  onPromptSelect?: (prompt: string) => void
}

export const QuickActions = ({ onActionClick, visible, onPromptSelect }: QuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(true)
  
  if (!visible) return null

  const handleActionClick = (prompt: string) => {
    if (onPromptSelect) {
      onPromptSelect(prompt)
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-8 rounded-lg bg-emerald-50/50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto w-full justify-start bg-white px-4 py-3 text-left text-gray-900 hover:bg-gray-50"
              onClick={() => handleActionClick(action.prompt)}
            >
              <span>{action.title}</span>
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}