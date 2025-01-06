import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Menu, PlusCircle, Settings, BookOpen, Brain } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ConversationList } from "./sidebar/ConversationList"
import { SidebarFooter } from "./sidebar/SidebarFooter"
import { SidebarHeader } from "./sidebar/SidebarHeader"
import { useSidebar } from "@/hooks/use-sidebar"

interface AppSidebarProps {
  conversations: any[]
  onConversationSelect: (id: string) => void
  currentConversationId?: string
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  firstName?: string
}

export function AppSidebar({
  conversations,
  onConversationSelect,
  currentConversationId,
  onNewConversation,
  onDeleteConversation,
  firstName = "User",
}: AppSidebarProps) {
  const location = useLocation()
  const { open: isSidebarOpen, setOpen: setIsSidebarOpen } = useSidebar()
  const [isHovered, setIsHovered] = useState(false)

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logout clicked")
  }

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "absolute left-2 top-2 h-10 w-10 px-0 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden",
          isSidebarOpen && "hidden"
        )}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-white shadow-lg transition-transform dark:bg-gray-900 lg:static lg:transition-none",
          !isSidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader firstName={firstName} onNewConversation={onNewConversation} />

        <div className="flex flex-1 flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={onNewConversation}
            >
              <PlusCircle className="h-5 w-5" />
              Nouvelle conversation
            </Button>

            <Link to="/creersequence">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-2",
                  location.pathname === "/creersequence" &&
                    "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <BookOpen className="h-5 w-5" />
                Créer une séquence
              </Button>
            </Link>

            <Link to="/exercices">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-2",
                  location.pathname === "/exercices" &&
                    "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Brain className="h-5 w-5" />
                Créer des exercices
              </Button>
            </Link>
          </div>

          <ScrollArea className="flex-1">
            <ConversationList
              conversations={conversations}
              onConversationSelect={onConversationSelect}
              currentConversationId={currentConversationId}
              onDeleteConversation={onDeleteConversation}
            />
          </ScrollArea>
        </div>

        <SidebarFooter onLogout={handleLogout} currentPath={location.pathname} />
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )
}