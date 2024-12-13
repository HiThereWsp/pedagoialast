import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, UserCircle, Zap } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"

const Index = () => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
      setUserId(session.user.id)
    }

    checkAuth()

    // Listen for auth changes
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

    // Add user message to the UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Save message to Supabase
      const { error: dbError } = await supabase
        .from('chats')
        .insert([
          { message: userMessage, user_id: userId, message_type: 'user' }
        ])

      if (dbError) throw dbError

      // Get AI response
      const response = await fetch('/functions/v1/chat-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.response

      // Save AI response to Supabase
      await supabase
        .from('chats')
        .insert([
          { 
            message: aiResponse, 
            user_id: userId,
            message_type: 'assistant'
          }
        ])

      // Add AI response to the UI
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

  // If no userId is set yet, show loading or return null
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

            <div className="mb-8 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${
                    msg.role === 'user' 
                      ? 'bg-emerald-50 ml-auto max-w-[80%]' 
                      : 'bg-gray-50 mr-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-50 rounded-lg p-4 mr-auto max-w-[80%]">
                  <p className="text-gray-500">En train d'écrire...</p>
                </div>
              )}
            </div>

            <div className="mb-8 rounded-lg bg-emerald-50 p-6">
              <div className="mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Actions rapides</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  "Créer un exercice",
                  "Générer une séquence",
                  "Rechercher dans le programme scolaire officiel",
                  "Créer une progression",
                  "Adapter un exercice",
                  "Planifier une séance",
                  "Créer un plan de différenciation",
                ].map((action) => (
                  <div
                    key={action}
                    className="cursor-pointer rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <span className="text-gray-900">{action}</span>
                  </div>
                ))}
              </div>
            </div>
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