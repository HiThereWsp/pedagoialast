import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { ChatHistory } from "@/components/ChatHistory"
import { QuickActions } from "@/components/QuickActions"
import { WelcomeBanner } from "@/components/WelcomeBanner"
import { ChatInput } from "@/components/ChatInput"
import { useChat } from "@/hooks/useChat"
import { Loader2 } from "lucide-react"

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    conversations,
    loadConversationMessages,
    currentConversationId
  } = useChat(userId)
  const [showQuickActions, setShowQuickActions] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
      setUserId(session.user.id)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login')
        return
      }
      setUserId(session.user.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false)
    }
  }, [messages])

  const handleQuickAction = async (action: string) => {
    await sendMessage(action)
  }

  const handleNewConversation = () => {
    setMessages([])
    setShowQuickActions(true)
  }

  if (!userId) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
        <AppSidebar 
          conversations={conversations}
          onConversationSelect={loadConversationMessages}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <nav className="flex-shrink-0 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assistant Pédagogique IA</h1>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-4 py-8">
              {!currentConversationId && <WelcomeBanner />}
              <ChatHistory messages={messages} isLoading={isLoading} />
              <QuickActions onActionClick={handleQuickAction} visible={showQuickActions} />
            </div>
          </main>

          <div className="flex-shrink-0">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index