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

  if (!userId) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1">
          <nav className="border-b">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-xl font-semibold">Assistant Pédagogique IA</h1>
              <button className="p-2">
                <UserCircle className="h-6 w-6" />
              </button>
            </div>
          </nav>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <WelcomeBanner />
            <ChatHistory messages={messages} isLoading={isLoading} />
            <QuickActions />
          </div>

          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index