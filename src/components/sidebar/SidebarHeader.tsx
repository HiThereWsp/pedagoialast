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
    <div className="p-2 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="truncate transition-all duration-300">
            {firstName || 'Chargement...'}
          </span>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            className="w-full transition-all duration-300 bg-emerald-500 hover:bg-emerald-600" 
            size="lg"
            onClick={onNewConversation}
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="ml-2 truncate transition-all duration-300">
              Nouvelle conversation
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Nouvelle conversation
        </TooltipContent>
      </Tooltip>
    </div>
  )
}