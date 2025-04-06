import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, Globe, Brain } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Message, Thread } from '@/types/supabase';
import { useAuth } from '@/hooks/useAuth';

export const ChatPage = () => {
  const {user} = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);

  useEffect(() => {
    if (threadId) {
      loadThreadMessages();
    } else {
      setMessages([]);
    }
  }, [threadId]);

  const loadThreadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  const createThread = async (firstMessage: string): Promise<string> => {
    const { data: thread, error: threadError } = await supabase
      .from('chat_threads')
      .insert({
        title: firstMessage.slice(0, 100) + (firstMessage.length > 100 ? '...' : ''),
        preview: firstMessage,
        web_search_enabled: webSearch,
        deep_research_enabled: deepResearch,
        user_id: user?.id,
        status: 'active',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (threadError) throw threadError;
    return (thread as Thread).id;
  };

  const saveMessage = async (content: string, threadId: string, role: 'user' | 'assistant' = 'user'): Promise<Message> => {
    // First update the thread's last_message_at to trigger a refresh
    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    // Then save the message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        content,
        role,
        tokens_used: 0,
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return message as Message;
  };

  const generateResponse = async (threadId: string, messageId: string, messages: Message[]) => {
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        threadId,
        messageId,
        messages,
        webSearchEnabled: webSearch,
        deepResearchEnabled: deepResearch,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Load the latest messages after the response is generated
    const { data: updatedMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    return updatedMessages as Message[];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Create a new thread if needed
      const currentThreadId = threadId || await createThread(messageContent);
      
      // Save user message
      const userMessage = await saveMessage(messageContent, currentThreadId);
      setMessages(prev => [...prev, userMessage]);

      // Navigate to thread if it's a new one
      if (!threadId) {
        navigate(`/chat/${currentThreadId}`, { replace: true });
      }

      // Generate response and get updated messages
      const updatedMessages = await generateResponse(currentThreadId, userMessage.id, [...messages, userMessage]);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {messages.length === 0 ? (
        // Center the input when no messages
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-4">
            <div className="w-full max-w-2xl space-y-4">
              <div className="flex justify-center mb-8">
                <Bot className="h-12 w-12 text-blue-500" />
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Comment puis-je vous aider aujourd'hui?</h2>
                <p className="text-gray-600">Je suis votre assistant IA, prêt à vous aider dans vos tâches.</p>
              </div>
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="pr-[120px] shadow-lg bg-white/90 backdrop-blur-sm rounded-xl border-0 resize-none focus-visible:ring-1 focus-visible:ring-blue-200 transition-all"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-2 p-1 rounded-lg bg-white/50 backdrop-blur-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Switch
                            checked={webSearch}
                            onCheckedChange={setWebSearch}
                            className="data-[state=checked]:bg-blue-500"
                          />
                          <Globe className={`h-4 w-4 ml-1 transition-colors ${webSearch ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable web search</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Switch
                            checked={deepResearch}
                            onCheckedChange={setDeepResearch}
                            className="data-[state=checked]:bg-purple-500"
                          />
                          <Brain className={`h-4 w-4 ml-1 transition-colors ${deepResearch ? 'text-purple-500' : 'text-gray-400'}`} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable deep research</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="sm"
                    className="px-3 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Show messages and input at bottom when there are messages
        <>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-6 rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <span></span>
                <div
                  className={`max-w-[80%] rounded-xl p-4 shadow-lg transition-shadow hover:shadow-xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-4'
                      : 'bg-gradient-to-br from-blue-50 to-white mr-4'
                  }`}
                >
                  <div className={`text-left ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 mr-4 shadow-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-[120px] shadow-lg bg-white/90 backdrop-blur-sm rounded-xl border-0 resize-none focus-visible:ring-1 focus-visible:ring-blue-200 transition-all"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2 p-1 rounded-lg bg-white/50 backdrop-blur-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Switch
                        checked={webSearch}
                        onCheckedChange={setWebSearch}
                        className="data-[state=checked]:bg-blue-500"
                      />
                      <Globe className={`h-4 w-4 ml-1 transition-colors ${webSearch ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable web search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Switch
                        checked={deepResearch}
                        onCheckedChange={setDeepResearch}
                        className="data-[state=checked]:bg-purple-500"
                      />
                      <Brain className={`h-4 w-4 ml-1 transition-colors ${deepResearch ? 'text-purple-500' : 'text-gray-400'}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable deep research</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-3 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
