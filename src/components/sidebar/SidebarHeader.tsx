import { User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarHeaderProps {
  firstName: string | null;
  onNewConversation?: () => void;
}

export function SidebarHeader({ firstName, onNewConversation }: SidebarHeaderProps) {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {firstName || 'Chargement...'}
          </span>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost"
            size="icon"
            className="w-full flex items-center justify-center hover:bg-gray-100"
            onClick={onNewConversation}
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Nouvelle conversation</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Nouvelle conversation
        </TooltipContent>
      </Tooltip>
    </div>
  )
}