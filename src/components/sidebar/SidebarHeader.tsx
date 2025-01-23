import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarHeaderProps {
  firstName: string | null;
  onNewConversation?: () => void;
}

export function SidebarHeader({ firstName, onNewConversation }: SidebarHeaderProps) {
  return (
    <div className="p-2 space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gray-100/80 hover:bg-gray-200/80"
            onClick={onNewConversation}
          >
            <Plus className="h-5 w-5 text-gray-600" />
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