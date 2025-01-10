import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { ChatHistory } from "@/components/ChatHistory"
import { QuickActions } from "@/components/QuickActions"
import { WelcomeBanner } from "@/components/WelcomeBanner"
import { ChatInput } from "@/components/ChatInput"
import { useChat } from "@/hooks/useChat"
import { useToast } from "@/hooks/use-toast"
import { AppSidebar } from "@/components/AppSidebar"
import { LoadingIndicator } from "@/components/chat/LoadingIndicator"

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
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
          // Clear local storage to ensure clean state
          localStorage.removeItem('pedagoia-auth-token')
          navigate('/login')
          return
        }

        setUserId(session.user.id)
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .single()
          
        if (profileError) {
          console.error("Profile fetch error:", profileError)
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger votre profil"
          })
        } else {
          setFirstName(profileData?.first_name)
        }
      } catch (error) {
        console.error("Auth error:", error)
        // Clear local storage on error
        localStorage.removeItem('pedagoia-auth-token')
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
      console.log("Auth state changed:", event, session)
      
      if (event === 'SIGNED_OUT' || !session) {
        // Clear local storage on sign out
        localStorage.removeItem('pedagoia-auth-token')
        navigate('/login')
        return
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local storage on successful logout
      localStorage.removeItem('pedagoia-auth-token')
      navigate('/login')
    } catch (error) {
      console.error("Logout error:", error)
      // Force navigation to login even if logout fails
      localStorage.removeItem('pedagoia-auth-token')
      navigate('/login')
    }
  }

  if (!userId) return (
    <div className="flex h-screen items-center justify-center">
      <LoadingIndicator />
    </div>
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex w-full">
        <AppSidebar 
          conversations={conversations}
          onConversationSelect={loadConversationMessages}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={deleteConversation}
          firstName={firstName}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto relative flex flex-col">
            {!currentConversationId && (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <WelcomeBanner />
                <QuickActions 
                  onActionClick={handleQuickAction} 
                  visible={showQuickActions}
                  onPromptSelect={handlePromptSelect}
                />
              </div>
            )}
            {currentConversationId && (
              <div className="max-w-5xl mx-auto w-full px-6 py-6 pb-32">
                <ChatHistory messages={messages} isLoading={isLoading} />
              </div>
            )}
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
    </div>
  )
}

export default Index