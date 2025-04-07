import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, Globe, Brain } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase, supabaseUrl, supabaseKey } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown

export const ChatPage = () => {
  const { user } = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const [showInitialChat, setShowInitialChat] = useState(true);
  const [isInitialChatVisible, setIsInitialChatVisible] = useState(false);
  const [isConversationVisible, setIsConversationVisible] = useState(false);

  useEffect(() => {
    if (threadId) {
      loadThreadMessages();
      setShowInitialChat(false);
      setIsConversationVisible(true);
    } else {
      setMessages([]);
      setStreamingContent('');
      setShowInitialChat(true);
      setIsConversationVisible(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (showInitialChat) {
      setIsInitialChatVisible(true);
    }
  }, [showInitialChat]);

  useEffect(() => {
    if (messages.length > 0) {
      setIsConversationVisible(true);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    console.log('Messages:', messages);
    console.log('Streaming Content:', streamingContent);
  }, [messages, streamingContent]);

  useEffect(() => {
    const streamingMessage = messages.find(msg => msg.metadata?.streaming);
    if (streamingMessage) {
      console.log('Streaming message detected:', streamingMessage);
    }
  }, [messages]);

  const loadThreadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    } else {
      console.error('Error loading messages:', error);
    }
  };

  const createThread = async (firstMessage) => {
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

    if (threadError) {
      console.error('Error creating thread:', threadError);
      throw threadError;
    }
    return thread.id;
  };

  const saveMessage = async (content, threadId, role = 'user', metadata = {}) => {
    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        content,
        role,
        tokens_used: 0,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    return message;
  };

  const generateResponse = async (threadId, messageId, currentMessages) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/chat-completion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            threadId,
            messageId,
            messages: currentMessages,
            webSearchEnabled: webSearch,
            deepResearchEnabled: deepResearch,
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      let streamingMessage = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts && !streamingMessage) {
        const { data: updatedMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching streaming message:', error);
          break;
        }

        streamingMessage = updatedMessages.find(msg =>
          msg.role === 'assistant' &&
          msg.metadata?.in_response_to === messageId &&
          msg.metadata?.streaming
        );

        if (!streamingMessage) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (!streamingMessage) {
        throw new Error('Streaming message not found in database');
      }

      setMessages(prev => [...prev, streamingMessage]);
      setStreamingContent('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Chunk:', chunk);

        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      let finalMessage = null;
      attempts = 0;

      while (attempts < maxAttempts && !finalMessage) {
        const { data: updatedMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching final message:', error);
          break;
        }

        finalMessage = updatedMessages.find(msg =>
          msg.role === 'assistant' &&
          msg.metadata?.in_response_to === messageId &&
          !msg.metadata?.streaming
        );

        if (!finalMessage) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (!finalMessage) {
        throw new Error('Final message not found in database');
      }

      setMessages(prev => {
        const updatedMessages = [...prev];
        const streamingIndex = updatedMessages.findIndex(msg => msg.metadata?.streaming);
        if (streamingIndex !== -1) {
          updatedMessages[streamingIndex] = finalMessage;
        }
        return updatedMessages;
      });

      setStreamingContent('');
      return finalMessage;
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => prev.filter(msg => !msg.metadata?.streaming));
      setStreamingContent('');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const currentThreadId = threadId || await createThread(messageContent);
      const userMessage = await saveMessage(messageContent, currentThreadId, 'user');
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      if (!threadId) {
        navigate(`/chat/${currentThreadId}`, { replace: true });
      }

      await generateResponse(currentThreadId, userMessage.id, updatedMessages);
    } catch (error) {
      console.error('Error in handleSend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {showInitialChat && !isLoading ? (
        <div 
          className={`flex-1 flex flex-col items-center justify-center transition-opacity duration-500 ${
            isInitialChatVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex justify-center mb-8">
              <Bot className="h-12 w-12 text-[#FFD700] transition-transform duration-500 hover:scale-110" />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2 transition-all duration-500">Comment puis-je vous aider aujourd'hui?</h2>
              <p className="text-gray-600 transition-all duration-500">Je suis votre assistant IA, prêt à vous aider dans vos tâches.</p>
            </div>
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="pr-[120px] shadow-lg bg-white/90 backdrop-blur-sm rounded-xl border-0 resize-none focus-visible:ring-1 focus-visible:ring-blue-200 transition-all text-base font-normal leading-7"
                style={{
                  fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '28px'
                }}
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
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFD700] data-[state=checked]:to-[#FFA500] transition-colors duration-300"
                        />
                        <Globe className={`h-4 w-4 ml-1 transition-colors duration-300 ${webSearch ? 'text-[#FFD700]' : 'text-gray-400'}`} />
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
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFD700] data-[state=checked]:to-[#FFA500] transition-colors duration-300"
                        />
                        <Brain className={`h-4 w-4 ml-1 transition-colors duration-300 ${deepResearch ? 'text-[#FFD700]' : 'text-gray-400'}`} />
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
                  className="px-3 h-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-white shadow-md transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex-1 overflow-y-auto space-y-4 mb-4 p-6 rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative transition-all duration-500 ${
            isConversationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 shadow-lg transition-shadow hover:shadow-xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white ml-4'
                      : 'bg-gradient-to-br from-blue-50 to-white mr-4'
                  }`}
                >
                  <div className={`text-left text-base font-normal leading-7 ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`} style={{
                    fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '28px'
                  }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose max-w-none"
                    >
                      {message.metadata?.streaming ? (streamingContent || '') : message.content}
                    </ReactMarkdown>
                    {message.metadata?.streaming && (
                      <span className="inline-block ml-1 animate-pulse">▋</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && !messages.some(msg => msg.metadata?.streaming) && (
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
              className="pr-[120px] shadow-lg bg-white/90 backdrop-blur-sm rounded-xl border-0 resize-none focus-visible:ring-1 focus-visible:ring-blue-200 transition-all text-base font-normal leading-7"
              style={{
                fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '28px'
              }}
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
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFD700] data-[state=checked]:to-[#FFA500] transition-colors duration-300"
                      />
                      <Globe className={`h-4 w-4 ml-1 transition-colors duration-300 ${webSearch ? 'text-[#FFD700]' : 'text-gray-400'}`} />
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
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFD700] data-[state=checked]:to-[#FFA500] transition-colors duration-300"
                      />
                      <Brain className={`h-4 w-4 ml-1 transition-colors duration-300 ${deepResearch ? 'text-[#FFD700]' : 'text-gray-400'}`} />
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
                className="px-3 h-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-white shadow-md transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
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