
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChevronLeft, Menu } from "lucide-react"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import { ConversationList } from "./sidebar/ConversationList"
import { SidebarHeader } from "./sidebar/SidebarHeader"
import { SidebarFooter } from "./sidebar/SidebarFooter"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AppSidebarProps {
  conversations: Array<{id: string, title: string}>
  onConversationSelect: (id: string) => void
  currentConversationId?: string | null
  onNewConversation?: () => void
  onDeleteConversation: (id: string) => void
  firstName?: string | null
  onLogout: () => void
}

export function AppSidebar({
  conversations,
  onConversationSelect,
  currentConversationId,
  onNewConversation,
  onDeleteConversation,
  firstName,
  onLogout
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden"
        )}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full flex-col border-r bg-background transition-all duration-300 md:relative md:translate-x-0",
          isCollapsed ? "w-0 md:w-0 opacity-0" : "w-64",
          !isMobileOpen && "-translate-x-full"
        )}
      >
        <TooltipProvider>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
              <SidebarHeader 
                firstName={firstName}
                onNewConversation={onNewConversation}
              />
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )} />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <ConversationList
                conversations={conversations}
                onConversationSelect={onConversationSelect}
                currentConversationId={currentConversationId}
                onDeleteConversation={onDeleteConversation}
              />
            </ScrollArea>

            <SidebarFooter 
              onLogout={onLogout}
              currentPath={location.pathname}
              firstName={firstName}
            />
          </div>
        </TooltipProvider>
      </aside>
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40 hidden md:flex"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
    </>
  )
}
