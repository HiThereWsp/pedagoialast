import { MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ConversationListProps {
  conversations: Array<{id: string, title: string}>
  onConversationSelect: (id: string) => void
  currentConversationId?: string | null
  onDeleteConversation: (id: string) => void
}

export function ConversationList({ 
  conversations,
  onConversationSelect,
  currentConversationId,
  onDeleteConversation
}: ConversationListProps) {
  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    onDeleteConversation?.(conversationId)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id} className="group-data-[collapsible=true]:hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton 
                    className="w-full justify-between group"
                    onClick={() => onConversationSelect?.(conversation.id)}
                    data-active={currentConversationId === conversation.id}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden"
                      onClick={(e) => handleDelete(e, conversation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                    </Button>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {conversation.title}
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}