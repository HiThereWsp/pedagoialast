import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"
import { v4 as uuidv4 } from 'uuid'

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

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
      .not('conversation_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error loading conversations:", error)
      return
    }

    // Group by conversation_id and get unique conversations with their titles
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
    // Detect if the message is in English using a simple heuristic
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
      // If this is the first message in a new conversation, generate a title
      if (!currentConversationId) {
        const title = await generateTitle(userMessage)
        setCurrentConversationId(conversationId)
        
        // Add the new conversation to the list
        setConversations(prev => [{
          id: conversationId,
          title
        }, ...prev])
      }

      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])

      // Save user message to database
      await supabase
        .from('chats')
        .insert([{
          message: userMessage,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
          conversation_title: !currentConversationId ? await generateTitle(userMessage) : undefined
        }])

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: { message: userMessage }
      })

      if (error) throw error

      const aiResponse = data.response

      // Save AI response to database
      await supabase
        .from('chats')
        .insert([{
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId
        }])

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!userId) return

    try {
      // Delete all messages from this conversation
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error

      // Update the conversations list
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      
      // If the deleted conversation was the current one, clear messages
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
