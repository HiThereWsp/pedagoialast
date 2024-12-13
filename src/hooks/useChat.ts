import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { ChatMessage } from "@/types/chat"

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()

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

  return {
    messages,
    isLoading,
    sendMessage
  }
}