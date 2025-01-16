import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AppSidebar } from "@/components/AppSidebar"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export default function Index() {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [firstName, setFirstName] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/login')
          return
        }

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
  }

  const handleNewConversation = () => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: "Nouvelle conversation"
    }
    setConversations(prev => [...prev, newConversation])
    setCurrentConversationId(newConversation.id)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
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
          {currentConversationId ? (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Conversation content will go here */}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                Sélectionnez une conversation ou créez-en une nouvelle
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}