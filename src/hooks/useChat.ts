import { useEffect } from "react"
import { useConversationContext } from "./chat/useConversationContext"
import { useConversationManagement } from "./chat/useConversationManagement"
import { useMessageManagement } from "./chat/useMessageManagement"

export const useChat = (userId: string | null) => {
  const {
    conversationContext,
    updateContext,
    loadContext,
    clearContext
  } = useConversationContext(userId)

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loadConversations,
    createNewConversation,
    deleteConversation
  } = useConversationManagement(userId)

  const {
    messages,
    setMessages,
    isLoading,
    loadConversationMessages,
    sendMessage
  } = useMessageManagement(userId)

  useEffect(() => {
    if (userId) {
      console.log("Loading conversations for user:", userId)
      loadConversations()
    }
  }, [userId])

  const handleLoadConversationMessages = async (conversationId: string) => {
    console.log("Loading messages for conversation:", conversationId)
    await loadConversationMessages(conversationId)
    await loadContext(conversationId)
    setCurrentConversationId(conversationId)
  }

  const handleSendMessage = async (message: string, useWebSearch?: boolean) => {
    if (!message.trim() || isLoading || !userId) {
      console.log("Message send blocked:", { message, isLoading, userId })
      return
    }

    try {
      console.log("Starting to send message:", message)
      setMessages(prev => [...prev, { role: 'user', content: message }])
      
      let currentId = currentConversationId
      let title: string | undefined

      if (!currentId) {
        console.log("Creating new conversation")
        const newConversation = await createNewConversation(message)
        currentId = newConversation.conversationId
        title = newConversation.title
        console.log("New conversation created:", { currentId, title })
        setCurrentConversationId(currentId)
      }

      console.log("Sending message to AI")
      const aiResponse = await sendMessage(message, currentId, title, conversationContext, undefined, useWebSearch)
      
      if (aiResponse) {
        console.log("Received AI response:", aiResponse)
        await updateContext(currentId, message, aiResponse)
      } else {
        console.error("No AI response received")
      }

      console.log("Reloading conversation messages")
      await loadConversationMessages(currentId)
      await loadConversations()
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      throw error
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    console.log("Deleting conversation:", conversationId)
    await deleteConversation(conversationId)
    if (currentConversationId === conversationId) {
      setMessages([])
      clearContext()
      setCurrentConversationId(null)
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage: handleSendMessage,
    conversations,
    loadConversationMessages: handleLoadConversationMessages,
    currentConversationId,
    deleteConversation: handleDeleteConversation
  }
}