import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tiles } from "@/components/ui/tiles"
import { Send } from "lucide-react"
import { useState, useEffect } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid'
import { ChatMessage as ChatMessageComponent } from "@/components/chat/ChatMessage"

export const OfflineChatUI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour, comment puis-je t'aider ?"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const conversationId = uuidv4()

  const loadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error loading messages:", error)
        return
      }

      if (data) {
        const formattedMessages: ChatMessage[] = data.map(msg => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error in loadMessages:", error)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour envoyer des messages."
        })
        return
      }

      // Save user message
      const { error: insertError } = await supabase
        .from('chats')
        .insert({
          message: userMessage.content,
          user_id: session.user.id,
          conversation_id: conversationId,
          message_type: 'user'
        })

      if (insertError) {
        console.error("Error saving message:", insertError)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'envoyer le message."
        })
        return
      }

      // Get AI response
      const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('chat-with-anthropic', {
        body: { message: userMessage.content }
      })

      if (aiError) {
        console.error("Error from edge function:", aiError)
        throw aiError
      }

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: aiResponseData.response || "Désolé, je n'ai pas pu traiter votre demande."
      }

      // Save AI response
      await supabase
        .from('chats')
        .insert({
          message: aiResponse.content,
          user_id: session.user.id,
          conversation_id: conversationId,
          message_type: 'assistant'
        })

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen flex flex-col">
      <div className="absolute inset-0 opacity-15 bg-gradient-to-br from-purple-50 to-blue-50">
        <Tiles rows={50} cols={8} tileSize="md" />
      </div>

      <Card className="relative flex-1 bg-background/95 backdrop-blur-sm border-muted shadow-lg rounded-lg overflow-hidden">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessageComponent key={index} message={message} />
            ))}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="relative p-4 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="flex-1 bg-background/95 backdrop-blur-sm border-muted shadow-lg focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105"
          disabled={isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
