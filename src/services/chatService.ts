import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

export const chatService = {
  async sendMessage(message: string, userId: string, conversationId: string | null) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          message,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
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