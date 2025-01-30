import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AppSidebar } from "@/components/AppSidebar"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@/hooks/useChat"
import { ChatInput } from "@/components/ChatInput"
import { ChatHistory } from "@/components/ChatHistory"
import { SEO } from "@/components/SEO"
import { ImageGenerator } from "@/components/image-generation/ImageGenerator"

export default function Index() {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [firstName, setFirstName] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          navigate('/login')
          return
        }

        if (!session) {
          console.log('No active session found')
          navigate('/login')
          return
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event)
            if (event === 'SIGNED_OUT' || !currentSession) {
              navigate('/login')
              return
            }
          }
        )

        // Fetch user profile
        if (session.user) {
          setUserId(session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else if (profile) {
            setFirstName(profile.first_name)
          }
        }

        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking session:', error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [navigate])

  const {
    messages,
    isLoading: chatLoading,
    sendMessage: originalSendMessage,
    conversations: chatConversations,
    loadConversationMessages,
    currentConversationId: activeChatId,
    deleteConversation
  } = useChat(userId)

  const handleSendMessage = async (
    message: string, 
    attachments?: Array<{ url: string; fileName?: string; fileType?: string }>,
    useWebSearch?: boolean
  ) => {
    await originalSendMessage(message, useWebSearch)
  }

  useEffect(() => {
    if (chatConversations) {
      setConversations(chatConversations)
    }
  }, [chatConversations])

  useEffect(() => {
    if (activeChatId) {
      setCurrentConversationId(activeChatId)
    }
  }, [activeChatId])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear any local state
      setUserId(null)
      setFirstName("")
      setConversations([])
      setCurrentConversationId("")
      
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      })
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    setCurrentConversationId(conversationId)
    await loadConversationMessages(conversationId)
  }

  const handleNewConversation = () => {
    setCurrentConversationId("")
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      if (currentConversationId === conversationId) {
        setCurrentConversationId("")
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la conversation.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Chat | PedagoIA - Assistant pédagogique intelligent"
        description="Discutez avec PedagoIA pour créer des contenus pédagogiques personnalisés et innovants."
      />
      <div className="flex h-screen">
        <AppSidebar
          conversations={conversations}
          onConversationSelect={handleConversationSelect}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          firstName={firstName}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            {messages && messages.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4">
                <ChatHistory messages={messages} isLoading={chatLoading} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center flex-col gap-8">
                <div>
                  <p className="text-2xl font-medium bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent mb-2">
                    {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
                  </p>
                  <p className="text-2xl font-medium premium-text">
                    Comment puis-je vous aider ?
                  </p>
                </div>
                
                <ImageGenerator />
              </div>
            )}
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={chatLoading}
            />
          </div>
        </main>
      </div>
    </>
  )
}