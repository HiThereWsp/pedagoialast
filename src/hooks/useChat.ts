import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"
import { v4 as uuidv4 } from 'uuid'
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) {
      loadConversations()
    }
  }, [userId])

  const loadConversations = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('chats')
      .select('conversation_id, conversation_title')
      .eq('user_id', userId)
      .is('deleted_at', null)  // Only get non-deleted conversations
      .not('conversation_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error loading conversations:", error)
      return
    }

    const uniqueConversations = data.reduce((acc: Array<{id: string, title: string}>, curr) => {
      if (curr.conversation_id && curr.conversation_title && 
          !acc.some(conv => conv.id === curr.conversation_id)) {
        acc.push({
          id: curr.conversation_id,
          title: curr.conversation_title
        })
      }
      return acc
    }, [])

    setConversations(uniqueConversations)
  }

  const loadConversationMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)  // Only get non-deleted messages
      .order('created_at', { ascending: true })

    if (error) {
      console.error("Error loading messages:", error)
      return
    }

    setMessages(data.map(msg => ({
      role: msg.message_type as 'user' | 'assistant',
      content: msg.message
    })))
    setCurrentConversationId(conversationId)
  }

  const generateTitle = async (message: string) => {
    const commonEnglishWords = /\b(the|is|are|was|were|have|has|had|been|will|would|could|should|may|might|must|can|a|an|and|or|but|in|on|at|to|for|of|with)\b/i;
    const isEnglish = commonEnglishWords.test(message.toLowerCase());

    try {
      const prompt = isEnglish
        ? "Generate a very short and concise title (max 5 words) for a conversation that starts with this message: "
        : "Génère un titre très court et concis (maximum 5 mots) en français pour une conversation qui commence par ce message : ";

      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: { 
          message: prompt + message,
          type: 'title-generation'
        }
      })

      if (error) throw error
      return data.response
    } catch (error) {
      console.error("Error generating title:", error)
      return isEnglish ? "New Conversation" : "Nouvelle conversation"
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()
    const conversationId = currentConversationId || uuidv4()

    try {
      if (!currentConversationId) {
        const title = await generateTitle(userMessage)
        setCurrentConversationId(conversationId)
        
        setConversations(prev => [{
          id: conversationId,
          title
        }, ...prev])
      }

      setMessages(prev => [...prev, { role: 'user', content: userMessage }])

      await supabase
        .from('chats')
        .insert([{
          message: userMessage,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
          conversation_title: !currentConversationId ? await generateTitle(userMessage) : undefined
        }])

      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: { message: userMessage }
      })

      if (error) throw error

      if (data.error && data.type === "UPGRADE_REQUIRED") {
        toast({
          title: "Limite d'utilisation atteinte",
          description: "Vous avez atteint votre limite mensuelle de messages. Passez à un forfait supérieur pour continuer à utiliser notre service sans interruption.",
          variant: "destructive",
          action: (
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Voir les forfaits
            </button>
          ),
        })
        return
      }

      const aiResponse = data.response

      await supabase
        .from('chats')
        .insert([{
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId
        }])

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('chats')
        .update({ deleted_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error

      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      
      if (currentConversationId === conversationId) {
        setMessages([])
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    conversations,
    loadConversationMessages,
    currentConversationId,
    deleteConversation
  }
}
