
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
import { ChatMessage as ChatMessageComponent } from "@/components/chat/ChatMessage"

interface OfflineChatUIProps {
  currentConversationId?: string | null
  onNewConversation: (message: string) => Promise<{ conversationId: string; title: string }>
}

export const OfflineChatUI = ({ currentConversationId, onNewConversation }: OfflineChatUIProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour, comment puis-je t'aider ?"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !currentConversationId) return

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error loading messages:", error)
        return
      }

      if (data) {
        const formattedMessages: ChatMessage[] = data.map(msg => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          id: msg.id
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error in loadMessages:", error)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [currentConversationId])

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

      let conversationId = currentConversationId
      if (!conversationId) {
        const newConversation = await onNewConversation(userMessage.content)
        conversationId = newConversation.conversationId
      }

      // Save user message
      const { data: userMessageData, error: insertError } = await supabase
        .from('chats')
        .insert({
          message: userMessage.content,
          user_id: session.user.id,
          conversation_id: conversationId,
          message_type: 'user'
        })
        .select()

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

      const { data: assistantMessageData, error: assistantError } = await supabase
        .from('chats')
        .insert({
          message: aiResponseData.response || "Désolé, je n'ai pas pu traiter votre demande.",
          user_id: session.user.id,
          conversation_id: conversationId,
          message_type: 'assistant'
        })
        .select()

      if (assistantError) {
        throw assistantError
      }

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: aiResponseData.response || "Désolé, je n'ai pas pu traiter votre demande.",
        id: assistantMessageData?.[0]?.id
      }

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
    <div className="relative h-[calc(100vh-2rem)] flex flex-col mx-auto max-w-5xl">
      <div className="absolute inset-0 opacity-15 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
        <Tiles rows={50} cols={8} tileSize="md" />
      </div>

      <Card className="relative flex-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-muted shadow-lg rounded-lg overflow-hidden mx-4">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-6 space-y-6">
            {messages.map((message, index) => (
              <ChatMessageComponent key={index} message={message} />
            ))}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="relative p-4 flex gap-3 mx-4 mt-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="flex-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-muted shadow-lg focus:ring-2 focus:ring-[#9b87f5]/50 transition-all duration-300 text-gray-800 dark:text-gray-100"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-gradient-to-r from-[#9b87f5] to-[#8b5cf6] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105"
          disabled={isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
