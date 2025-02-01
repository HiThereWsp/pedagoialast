import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

export const chatService = {
  async sendMessage(message: string, userId: string, conversationId: string | null) {
    try {
      const currentTimestamp = new Date().toISOString();
      
      const messageData = {
        message,
        user_id: userId,
        conversation_id: conversationId,
        message_type: 'user',
        created_at: currentTimestamp
      };

      const { data, error } = await supabase
        .from('chats')
        .insert(messageData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error sending message:', error);
        
        if (error.code === '23505') {
          const { data: existingMessage } = await supabase
            .from('chats')
            .select('*')
            .match({
              conversation_id: conversationId,
              user_id: userId,
              message: message
            })
            .maybeSingle();
            
          return existingMessage;
        }
        
        throw error;
      }

      return data;
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