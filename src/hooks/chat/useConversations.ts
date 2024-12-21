import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const useConversations = (userId: string | null) => {
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
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  return {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    deleteConversation,
    loadConversations
  }
}