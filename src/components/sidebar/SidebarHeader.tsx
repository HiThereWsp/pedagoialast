
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarHeaderProps {
  firstName: string | null;
  onNewConversation?: () => void;
}

export function SidebarHeader({ firstName, onNewConversation }: SidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-center">
        <img 
          src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
          alt="PedagoIA Logo" 
          className="w-[120px] h-[140px] object-contain" 
        />
      </div>
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
