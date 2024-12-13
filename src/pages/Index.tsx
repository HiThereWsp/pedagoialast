import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, UserCircle } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { ChatMessage } from "@/types/chat"
import { ChatHistory } from "@/components/ChatHistory"
import { QuickActions } from "@/components/QuickActions"

const Index = () => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()
    setMessage("")

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const { error: dbError } = await supabase
        .from('chats')
        .insert([
          { message: userMessage, user_id: userId, message_type: 'user' }
        ])

      if (dbError) throw dbError

      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { message: userMessage }
      })

      if (error) throw error

      const aiResponse = data.response

      await supabase
        .from('chats')
        .insert([
          { 
            message: aiResponse, 
            user_id: userId,
            message_type: 'assistant'
          }
        ])

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!userId) return null;

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
            <div className="mb-8 rounded-lg bg-emerald-50 p-6">
              <h2 className="mb-2 text-2xl font-semibold">
                Bonjour, je suis Élia, votre assistante pédagogique IA
              </h2>
              <p className="text-gray-600">
                Je peux vous aider sur tous les aspects de votre métier. Posez simplement votre question !
              </p>
            </div>

            <ChatHistory messages={messages} isLoading={isLoading} />
            <QuickActions />
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
            <div className="mx-auto max-w-7xl">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder="Comment puis-je vous aider ?" 
                  className="flex-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index
