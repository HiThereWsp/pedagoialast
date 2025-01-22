import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AppSidebar } from "@/components/AppSidebar"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@/hooks/useChat"
import { ChatInput } from "@/components/ChatInput"
import { ChatHistory } from "@/components/ChatHistory"
import { SEO } from "@/components/SEO"

export default function Index() {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [firstName, setFirstName] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  // Récupérer l'ID utilisateur depuis Supabase
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/login')
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFirstName(profile.first_name)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [navigate])

  // Utiliser le hook useChat
  const {
    messages,
    isLoading,
    sendMessage,
    conversations: chatConversations,
    loadConversationMessages,
    currentConversationId: activeChatId,
    deleteConversation
  } = useChat(userId)

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
      await supabase.auth.signOut()
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
                <ChatHistory messages={messages} isLoading={isLoading} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  Sélectionnez une conversation ou créez-en une nouvelle
                </p>
              </div>
            )}
            <ChatInput 
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </>
  )
}