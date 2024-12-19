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
    setMessages,
    isLoading, 
    sendMessage, 
    conversations,
    loadConversationMessages,
    currentConversationId,
    deleteConversation
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
          onDeleteConversation={deleteConversation}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="flex-shrink-0 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="h-16 flex items-center px-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assistant Pédagogique IA</h1>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto relative px-6">
            <div className="max-w-5xl mx-auto w-full py-6 pb-32">
              {!currentConversationId && <WelcomeBanner />}
              <ChatHistory messages={messages} isLoading={isLoading} />
              <QuickActions onActionClick={handleQuickAction} visible={showQuickActions} />
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index