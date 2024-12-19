import { UserCircle } from "lucide-react"
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

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { messages, isLoading, sendMessage } = useChat(userId)
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

  if (!userId) return null

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <nav className="flex-shrink-0 border-b bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-semibold text-gray-900">Assistant Pédagogique IA</h1>
              <button className="rounded-full p-2 hover:bg-gray-100">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-8">
              <WelcomeBanner />
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