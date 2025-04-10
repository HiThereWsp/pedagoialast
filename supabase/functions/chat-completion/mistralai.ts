const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const mistralApiKey = "nRLOGoiJ40AxdwDgyKSQPuFaAXDvgKs5";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  [key: string]: any; // Allow additional fields in the incoming message
}

interface MistralRequest {
  messages: ChatMessage[];
  webSearchEnabled: boolean;
  deepResearchEnabled: boolean;
}

export async function streamMistralResponse(
  request: MistralRequest,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const { messages, webSearchEnabled, deepResearchEnabled } = request;
  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY environment variable is not set');
  }
  console.log("Messages", messages)
  // Validate messages
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }
  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      throw new Error(`Invalid role in message: ${msg.role}`);
    }
    if (typeof msg.content !== 'string' || msg.content.trim() === '') {
      throw new Error('Message content must be a non-empty string');
    }
  }

  // System prompt with formatting, security rules, and current date
  const systemPrompt = `
You are a helpful AI assistant. Follow these instructions for all responses:

1. **Formatting**: Format your response in Markdown for better readability. Use headings, lists, bold, italic, and code blocks where appropriate.
2. **Security Rules**:
   - Do not generate or share any malicious code, exploits, or harmful content.
   - Avoid sharing personal or sensitive information, even if requested.
   - Do not assist with illegal activities or provide instructions that could be used to harm individuals, systems, or networks.
   - If a request is ambiguous or potentially unsafe, respond with a clarification or a safe alternative.
3. **Contextual Awareness**:
   - Today's date is April 11, 2025. Use this date for any time-sensitive information or context.
   - If web search is enabled (${webSearchEnabled}), you may reference recent information up to April 11, 2025.
   - If deep research is enabled (${deepResearchEnabled}), provide more detailed and analytical responses.
4. **Tone and Style**:
   - Be professional, concise, and clear.
   - Avoid speculative or unverified information. If unsure, state that the information is not available or suggest where the user might find it.

Now, respond to the user's message in Markdown format.
`;

  // Prepend the system prompt to the messages and strip extra fields
  const messagesWithSystemPrompt = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ];

  // Prepare the request payload
  const payload = {
    model: 'mistral-small-latest', // Using a known valid model
    messages: messagesWithSystemPrompt,
    stream: true,
    temperature: 0.7,
    max_tokens: 500
  };

  console.log('Mistral API request payload:', JSON.stringify(payload));

  try {
    // Call Mistral API with streaming
    const mistralResponse = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!mistralResponse.ok) {
      let errorBody = 'Unable to read response body';
      try {
        errorBody = await mistralResponse.text();
      } catch (e) {
        console.error('Error reading Mistral response body:', e);
      }
      const errorMessage = `Mistral API error: ${mistralResponse.status} ${mistralResponse.statusText}\nResponse body: ${errorBody}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!mistralResponse.body) {
      throw new Error('Mistral API response body is null');
    }

    const reader = mistralResponse.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing Mistral stream chunk:', e, 'Raw chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      // Signal that we're done streaming
      onDone();
    }
  } catch (error) {
    console.error('Error in streamMistralResponse:', error);
    // Generate a fallback response in case of error
    const errorResponse = "I apologize, but I encountered an error while processing your request. Please try again later.";
    onChunk(errorResponse);
    onDone();
  }
}

// Function to generate a completion from Mistral AI (non-streaming)
export async function generateMistralCompletion(messages: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullResponse = '';
    
    streamMistralResponse(
      { messages, webSearchEnabled: false, deepResearchEnabled: false },
      (chunk) => {
        fullResponse += chunk;
      },
      () => {
        resolve(fullResponse);
      }
    ).catch(error => {
      console.error('Error in generateMistralCompletion:', error);
      reject(error);
    });
  });
}