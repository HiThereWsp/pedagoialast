import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarHeaderProps {
  firstName: string | null;
  onNewConversation?: () => void;
}

export function SidebarHeader({ firstName, onNewConversation }: SidebarHeaderProps) {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {firstName || 'Chargement...'}
        </span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            className="group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:aspect-square bg-emerald-500 hover:bg-emerald-600 w-full transition-all duration-200" 
            size="lg"
            onClick={onNewConversation}
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="ml-2 truncate group-data-[collapsible=icon]:hidden">Nouvelle conversation</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Nouvelle conversation
        </TooltipContent>
      </Tooltip>
    </div>
  )
}