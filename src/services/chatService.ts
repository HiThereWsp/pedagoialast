import { ChatMessage } from '@/types/chat';

const SUPABASE_URL = "https://jpelncawdaounkidvymu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4";

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

export const chatService = {
  async sendMessage(message: string, userId: string, conversationId: string | null) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(conversationId: string) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/chats?conversation_id=eq.${conversationId}&order=created_at.asc`,
        {
          method: 'GET',
          headers
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
};