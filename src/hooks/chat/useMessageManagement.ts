import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { chatService } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const messagesData = await chatService.getMessages(conversationId);
      if (messagesData) {
        const formattedMessages = messagesData.map((msg: any) => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          attachments: msg.attachments as ChatMessage['attachments']
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error in loadConversationMessages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages."
      });
    }
  }

  const sendMessage = async (
    message: string,
    conversationId: string,
    conversationTitle: string | undefined,
    context: string,
    attachments?: ChatMessage['attachments'],
    useWebSearch?: boolean
  ) => {
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading || !userId) return;

    setIsLoading(true);
    try {
      await chatService.sendMessage(message, userId, conversationId);
      await loadConversationMessages(conversationId);
      
      // Simuler une réponse de l'assistant pour l'exemple
      const aiResponse = "Ceci est une réponse simulée de l'assistant.";
      
      return aiResponse;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    loadConversationMessages,
    sendMessage
  }
}