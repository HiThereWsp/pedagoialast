
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from 'uuid'

export const useConversationManagement = (userId: string | null) => {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const loadConversations = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('chats')
      .select('conversation_id, conversation_title')
      .eq('user_id', userId)
      .is('deleted_at', null)
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

  const createNewConversation = async (message: string) => {
    const conversationId = uuidv4()
    const title = await generateTitle(message)
    setCurrentConversationId(conversationId)
    setConversations(prev => [{
      id: conversationId,
      title
    }, ...prev])
    return { conversationId, title }
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

      await supabase
        .from('conversation_contexts')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loadConversations,
    createNewConversation,
    deleteConversation
  }
}
