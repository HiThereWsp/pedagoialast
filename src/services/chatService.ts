import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

export const chatService = {
  async sendMessage(
    message: string, 
    userId: string, 
    conversationId: string | null,
    messageType: 'user' | 'assistant' = 'user'
  ) {
    try {
      const messageData = {
        message,
        user_id: userId,
        conversation_id: conversationId,
        message_type: messageType,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chats')
        .insert(messageData)
        .select();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  },

  async getMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
};