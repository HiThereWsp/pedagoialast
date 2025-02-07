
import { MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    <SidebarGroup className="flex-1">
      <SidebarGroupContent className="px-2">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <SidebarMenu>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id} className="mb-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      className="w-full justify-between group hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
                      onClick={() => onConversationSelect?.(conversation.id)}
                      data-active={currentConversationId === conversation.id}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <MessageSquare className="mr-2 h-4 w-4 text-[#9b87f5]" />
                        <span className="truncate text-gray-700 dark:text-gray-200 group-hover:text-[#9b87f5] transition-colors">
                          {conversation.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 opacity-70 hover:opacity-100 transition-opacity"
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
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
