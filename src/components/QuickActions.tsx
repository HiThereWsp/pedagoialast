import { Zap, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

const quickActions = [
  "Créer un exercice",
  "Générer une séquence",
  "Rechercher dans le programme scolaire officiel",
  "Créer une progression",
  "Adapter un exercice",
  "Planifier une séance",
  "Créer un plan de différenciation",
]

interface QuickActionsProps {
  onActionClick: (action: string) => Promise<void>
  visible: boolean
}

export const QuickActions = ({ onActionClick, visible }: QuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(true)
  
  if (!visible) return null

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
              key={action}
              variant="outline"
              className="h-auto w-full justify-start bg-white px-4 py-3 text-left text-gray-900 hover:bg-gray-50"
              onClick={() => onActionClick(action)}
            >
              <span>{action}</span>
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}