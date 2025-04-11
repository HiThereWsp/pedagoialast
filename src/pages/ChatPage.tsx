import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, Globe, Brain, ThumbsUp, ThumbsDown, Pencil, X, Copy, Check, ExternalLink } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { supabase, supabaseUrl, supabaseKey } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import "../styles/markdown.css"; // Import markdown styles

// Source display components
const SourcesDisplay = ({ sources }) => {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  
  if (!sources || sources.length === 0) {
    return null;
  }
  
  // Take only the first 5 sources to display
  const displaySources = sources.slice(0, 5);
  
  // Function to truncate text to 2-3 lines (approx 150-200 chars)
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Try to find a period, question mark, or exclamation point to end at
    const endPunctuation = text.substring(0, maxLength).lastIndexOf('.');
    if (endPunctuation > maxLength * 0.7) {
      return text.substring(0, endPunctuation + 1);
    }
    
    // Otherwise just truncate at word boundary
    return text.substring(0, maxLength).replace(/\s\S*$/, '...'); 
  };
  
  return (
    <>
      <div className="flex items-center space-x-1 mb-2">
        {displaySources.map((source, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={() => window.open(source.url, '_blank')}
                >
                  {source.favicon ? (
                    <img 
                      src={source.favicon} 
                      alt={source.title} 
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <Globe className="w-3 h-3 text-gray-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{source.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-blue-500 hover:text-blue-700 p-0 h-6"
          onClick={() => setShowSourcesModal(true)}
        >
          View sources
        </Button>
      </div>
      
      <Dialog open={showSourcesModal} onOpenChange={setShowSourcesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sources</DialogTitle>
            <DialogDescription>
              Information used to generate this response
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
            {displaySources.map((source, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 mt-1 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                    {source.favicon ? (
                      <img 
                        src={source.favicon} 
                        alt={source.title} 
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-medium flex items-center"
                    >
                      {source.title}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <p className="text-gray-600 text-sm mt-1">{truncateText(source.text)}</p>
                    {source.publishedDate && (
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(source.publishedDate).toLocaleDateString()}
                        {source.author && ` • ${source.author}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const ChatPage = () => {
  const { user } = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showInitialChat, setShowInitialChat] = useState(true);
  const [isInitialChatVisible, setIsInitialChatVisible] = useState(false);
  const [isConversationVisible, setIsConversationVisible] = useState(false);
  const [messagesContainerOpacity, setMessagesContainerOpacity] = useState(0);
  const messagesEndRef = useRef(null);

  // Feedback state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentFeedbackMessageId, setCurrentFeedbackMessageId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  useEffect(() => {
    if (threadId) {
      loadThreadMessages();
      setShowInitialChat(false);
      setIsConversationVisible(true);
      setMessagesContainerOpacity(1);
      // Reset streaming state when changing threads
      setStreaming(false);
      setStreamingContent('');
    } else {
      setMessages([]);
      setStreamingContent('');
      setShowInitialChat(true);
      setIsConversationVisible(false);
      setMessagesContainerOpacity(0);
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
      setMessagesContainerOpacity(1);
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

  useEffect(() => {
    if (streamingContent) {
      setStreaming(true);
    } else {
      setStreaming(false);
    }
  }, [streamingContent]);

  const loadThreadMessages = async () => {
    if (!threadId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Set messages in local state
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
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

  const saveMessage = async (content, threadId, role, metadata) => {
    // Save message to database
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role,
        content,
        tokens_used: 0,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    
    // Update local messages state immediately
    if (message) {
      setMessages(prev => [...prev, message]);
    }
    
    return message;
  };

  const generateResponse = async (threadId, messageId, currentMessages = messages) => {
    try {
      setIsLoading(true);
      console.log('Starting response generation for thread:', threadId, 'message:', messageId);
      
      // Find the user message that triggered this response
      let userMessage = currentMessages.find(msg => msg.id === messageId);
      
      // If not found in current messages, try to get it from the database
      if (!userMessage) {
        console.log('User message not found in current messages, fetching from database');
        const { data: dbUserMessage, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('id', messageId)
          .single();
          
        if (error || !dbUserMessage) {
          console.error('Error fetching user message:', error);
          throw new Error('User message not found');
        }
        
        userMessage = dbUserMessage;
      }
      
      console.log('Found user message:', userMessage);
      
      // Make sure the user message is included in the conversation history
      let conversationHistory = [...currentMessages];
      const userMessageExists = conversationHistory.some(msg => msg.id === userMessage.id);
      
      if (!userMessageExists) {
        conversationHistory = [...conversationHistory, userMessage];
      }
      console.log('Conversation history for API:', conversationHistory.length, 'messages');

      // Check if web search is enabled for this message
      const webSearch = userMessage.metadata?.web_search_used || false;
      console.log('Web search enabled:', webSearch);
      
      let searchData = null;
      
      // Only perform search if web search is enabled
      if (webSearch) {
        // Step 1: Create a temporary message for search status
        const searchingTempId = `search_${threadId}_${messageId}`;
        console.log('Creating searching temp message with ID:', searchingTempId);
        const searchingMessage = {
          id: searchingTempId,
          thread_id: threadId,
          role: 'assistant',
          content: 'Searching for information...',
          created_at: new Date().toISOString(),
          tokens_used: 0,
          metadata: {
            streaming: true,
            in_response_to: messageId,
            web_search_used: webSearch,
            deep_research_used: userMessage.metadata?.deep_research_used
          }
        };
        
        // Add searching message to UI
        setMessages(prevMessages => [...prevMessages, searchingMessage]);
        
        // Step 1: Call chat-completion to get Exa AI results
        console.log('Sending first API request for Exa search');
        const searchResponse = await fetch(
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
              messages: conversationHistory,
              webSearchEnabled: webSearch,
              deepResearchEnabled: userMessage.metadata?.deep_research_used,
              searchOnly: true // Add this flag to indicate we only want search results
            })
          }
        );

        if (!searchResponse.ok) {
          console.error('Search API response not OK:', searchResponse.status, searchResponse.statusText);
          throw new Error('Failed to get search results');
        }
        
        // Parse the search results
        searchData = await searchResponse.json();
        console.log('Received search results:', searchData);
        
        // Update the searching message to show we're now thinking
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const searchingMessageIndex = updatedMessages.findIndex(msg => msg.id === searchingTempId);
          
          if (searchingMessageIndex !== -1) {
            updatedMessages[searchingMessageIndex] = {
              ...updatedMessages[searchingMessageIndex],
              content: 'Thinking...',
            };
            return updatedMessages;
          } else {
            console.warn('Could not find searching message with ID:', searchingTempId);
            return prevMessages;
          }
        });
      }
      
      // Step 2: Create a temporary message for the AI response
      const tempId = `temp_${threadId}_${messageId}`;
      console.log('Creating temp message with ID:', tempId);
      const tempStreamingMessage = {
        id: tempId,
        thread_id: threadId,
        role: 'assistant',
        content: webSearch ? 'Generating response based on search results...' : 'Generating response...',
        created_at: new Date().toISOString(),
        tokens_used: 0,
        metadata: {
          streaming: true,
          in_response_to: messageId,
          web_search_used: webSearch,
          deep_research_used: userMessage.metadata?.deep_research_used
        }
      };
      
      // Replace the searching message or add a new message if no search was performed
      setMessages(prevMessages => {
        if (webSearch) {
          // Replace the searching/thinking message with the streaming message
          return prevMessages.map(msg => 
            msg.id === `search_${threadId}_${messageId}` ? tempStreamingMessage : msg
          );
        } else {
          // Just add the streaming message
          return [...prevMessages, tempStreamingMessage];
        }
      });
      
      // Step 2: Call chat-completion again with the search results to get Mistral response
      console.log('Sending API request for Mistral response');
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
            messages: conversationHistory,
            webSearchEnabled: webSearch,
            deepResearchEnabled: userMessage.metadata?.deep_research_used,
            searchOnly: false, // This time we want the full response
            existingSearchResults: searchData?.sources || []
          })
        }
      );

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error('Failed to generate response');
      }
      console.log('API response received, starting to read stream');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream received');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      // Update UI immediately with chunks
      console.log('Starting to read stream chunks');
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Stream reading complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        console.log('Received chunk, current length:', fullResponse.length);

        // Update UI with streaming content - use function form to ensure we're working with the latest state
        setMessages(prevMessages => {
          const streamingIndex = prevMessages.findIndex(msg => msg.id === tempId);
          console.log('Updating streaming message at index:', streamingIndex);
          
          if (streamingIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[streamingIndex] = {
              ...updatedMessages[streamingIndex],
              content: fullResponse,
              // Preserve metadata during streaming updates
              metadata: updatedMessages[streamingIndex].metadata
            };
            return updatedMessages;
          } else {
            console.warn('Could not find streaming message with ID:', tempId);
            // If we can't find the message, add it
            return [...prevMessages, {
              ...tempStreamingMessage,
              content: fullResponse
            }];
          }
        });
      }

      // After streaming is complete, update the temporary message with final state
      console.log('Finalizing message after streaming');
      setMessages(prevMessages => {
        const streamingIndex = prevMessages.findIndex(msg => msg.id === tempId);
        console.log('Finalizing streaming message at index:', streamingIndex);
        
        if (streamingIndex !== -1) {
          const updatedMessages = [...prevMessages];
          // Make sure to include the sources from searchData in the final message metadata
          updatedMessages[streamingIndex] = {
            ...updatedMessages[streamingIndex],
            content: fullResponse,
            metadata: {
              ...updatedMessages[streamingIndex].metadata,
              streaming: false,
              sources: searchData?.sources || [] // Add the sources from the search data
            }
          };
          console.log('Updated message metadata with sources:', updatedMessages[streamingIndex].metadata);
          return updatedMessages;
        } else {
          console.warn('Could not find streaming message with ID:', tempId);
          // If we can't find the message, add it as a completed message
          return [...prevMessages, {
            ...tempStreamingMessage,
            content: fullResponse,
            metadata: {
              ...tempStreamingMessage.metadata,
              streaming: false,
              sources: searchData?.sources || [] // Add the sources from the search data
            }
          }];
        }
      });

      setIsLoading(false);
      console.log('Response generation complete');
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Remove temporary message on error
      setMessages(prevMessages => {
        console.log('Removing temporary messages on error');
        const updatedMessages = prevMessages.filter(msg => 
          !msg.id.startsWith('temp_') && !msg.id.startsWith('search_')
        );
        return updatedMessages;
      });
      
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    console.log('Sending message:', userMessage);
    
    // Set loading state immediately
    setIsLoading(true);

    try {
      // Create a new thread if we don't have one
      const currentThreadId = threadId || await createThread(userMessage);
      console.log('Using thread ID:', currentThreadId);
      
      // Save user message to database and update local state
      const savedMessage = await saveMessage(userMessage, currentThreadId, 'user', {
        web_search_used: webSearch,
        deep_research_used: deepResearch
      });
      console.log('Saved user message:', savedMessage);

      // Navigate to the new thread if we just created one
      if (!threadId) {
        console.log('Navigating to new thread:', currentThreadId);
        navigate(`/chat/${currentThreadId}`, { replace: true });
        
        // Wait a short time to ensure navigation completes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate response using the saved message
      console.log('Generating response with messages:', messages);
      await generateResponse(currentThreadId, savedMessage.id, messages);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const saveFeedback = async (messageId, type, text = null) => {
    try {
      const { error } = await supabase
        .from('message_feedback')
        .insert({
          message_id: messageId,
          user_id: user?.id,
          feedback_type: type, // 'thumbs_up', 'thumbs_down', or 'text'
          feedback_text: text
        });

      if (error) {
        console.error('Error saving feedback:', error);
      }
    } catch (error) {
      console.error('Error in saveFeedback:', error);
    }
  };

  const addTestMessageWithSources = async () => {
    if (!threadId) return;
    
    try {
      setIsLoading(true);
      
      // Create a test user message
      const testUserMessage = {
        id: `test-user-${Date.now()}`,
        thread_id: threadId,
        role: 'user',
        content: 'Tell me about the latest AI trends',
        created_at: new Date().toISOString(),
        tokens_used: 0,
        metadata: {
          web_search_used: true,
          deep_research_used: false
        }
      };
      
      // Add the test message to the UI
      setMessages(prevMessages => [...prevMessages, testUserMessage]);
      
      // Save the test message to the database
      const { data: savedMessage, error } = await supabase
        .from('chat_messages')
        .insert(testUserMessage)
        .select()
        .single();
        
      if (error) {
        console.error('Error saving test message:', error);
        return;
      }
      
      // Generate a response with sources
      await generateResponse(threadId, savedMessage.id, [...messages, savedMessage]);
      
    } catch (error) {
      console.error('Error adding test message with sources:', error);
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-2 p-1 rounded-lg bg-white/50 backdrop-blur-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <Switch
                          id="web-search"
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
                      <div className="flex items-center space-x-1">
                        <Switch
                          id="deep-research"
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
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
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
          <div 
            className="flex-1 overflow-y-auto space-y-4 mb-4 p-6 rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative transition-all duration-500"
            style={{
              opacity: messagesContainerOpacity,
              transform: `translateY(${messagesContainerOpacity === 0 ? '4px' : '0'})`
            }}
          >
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
                  {message.role === 'assistant' && message.metadata?.sources && message.metadata.sources.length > 0 && (
                    <SourcesDisplay sources={message.metadata.sources} />
                  )}
                  
                  <div className={`text-left text-base font-normal leading-7 ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`} style={{
                    fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '28px'
                  }}>
                    <div className="flex items-center space-x-2">
                      {message.metadata?.streaming && message.content === 'Streaming in progress...' && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                      <div className="flex-1 message-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="prose max-w-none"
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  
                  {message.role === 'assistant' && !message.metadata?.streaming && (
                    <div className="flex justify-start items-center mt-4 space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                setCopiedMessageId(message.id);
                                setTimeout(() => setCopiedMessageId(null), 2000);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full opacity-50 hover:opacity-100 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FFA500] hover:text-white transition-all duration-300"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                setCurrentFeedbackMessageId(message.id);
                                setFeedbackDialogOpen(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full opacity-50 hover:opacity-100 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FFA500] hover:text-white transition-all duration-300"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Provide text feedback</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                saveFeedback(message.id, 'thumbs_up');
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full opacity-50 hover:opacity-100 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FFA500] hover:text-white transition-all duration-300"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This was helpful</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                saveFeedback(message.id, 'thumbs_down');
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full opacity-50 hover:opacity-100 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FFA500] hover:text-white transition-all duration-300"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This was not helpful</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
                  handleSendMessage();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2 p-1 rounded-lg bg-white/50 backdrop-blur-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1">
                      <Switch
                        id="web-search"
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
                    <div className="flex items-center space-x-1">
                      <Switch
                        id="deep-research"
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
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
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

          <Dialog
            open={feedbackDialogOpen}
            onOpenChange={(open) => setFeedbackDialogOpen(open)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Provide Feedback</DialogTitle>
              </DialogHeader>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type your feedback..."
                className="pr-[120px] shadow-lg bg-white/90 backdrop-blur-sm rounded-xl border-0 resize-none focus-visible:ring-1 focus-visible:ring-blue-200 transition-all text-base font-normal leading-7"
                style={{
                  fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '28px'
                }}
                rows={3}
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    // Send feedback
                    saveFeedback(currentFeedbackMessageId, 'text', feedbackText);
                    setFeedbackText('');
                    setFeedbackDialogOpen(false);
                  }}
                  size="sm"
                  className="px-3 h-8 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-300"
                >
                  Send Feedback
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ChatPage;