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
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
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
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          throw error
        }

        if (!session) {
          navigate('/login')
          return
        }

        setUserId(session.user.id)
      } catch (error) {
        console.error("Auth error:", error)
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter"
        })
        navigate('/login')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        if (!session) {
          navigate('/login')
          return
        }
      }
      
      if (session) {
        setUserId(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, toast])

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

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt)
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
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <nav className="flex-shrink-0 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="h-16 flex items-center px-6 gap-2">
              <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">PedagoIA</h1>
              <div className="ml-auto">
              </div>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto relative">
            <div className="max-w-5xl mx-auto w-full px-6 py-6 pb-32">
              {!currentConversationId && <WelcomeBanner />}
              <ChatHistory messages={messages} isLoading={isLoading} />
              <QuickActions 
                onActionClick={handleQuickAction} 
                visible={showQuickActions}
                onPromptSelect={handlePromptSelect}
              />
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-900 dark:border-gray-800 z-10">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <ChatInput 
                onSendMessage={sendMessage} 
                isLoading={isLoading}
                value={inputValue}
                onChange={setInputValue}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index