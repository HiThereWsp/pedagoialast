
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export const useConversationContext = (userId: string | null) => {
  const [conversationContext, setConversationContext] = useState<string>("")

  const updateContext = async (
    conversationId: string,
    newMessage: string,
    aiResponse: string
  ) => {
    const updatedContext = `${conversationContext}\nUser: ${newMessage}\nAssistant: ${aiResponse}`.trim()
    setConversationContext(updatedContext)

    if (!userId) return

    await supabase
      .from('conversation_contexts')
      .upsert([{
        conversation_id: conversationId,
        user_id: userId,
        context: updatedContext
      }])
  }

  const loadContext = async (conversationId: string) => {
    if (!userId) return

    const { data, error } = await supabase
      .from('conversation_contexts')
      .select('context')
      .eq('conversation_id', conversationId)
      .maybeSingle()

    if (!error && data) {
      setConversationContext(data.context)
    } else {
      // If no context exists yet, start with an empty context
      setConversationContext("")
    }
  }

  const clearContext = () => {
    setConversationContext("")
  }

  return {
    conversationContext,
    updateContext,
    loadContext,
    clearContext
  }
}
