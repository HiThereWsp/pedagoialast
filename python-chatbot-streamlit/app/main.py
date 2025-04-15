import streamlit as st
import os
import time
from dotenv import load_dotenv
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from exa_py import Exa

# Load environment variables
load_dotenv()

# Initialize API clients
mistral_client = MistralClient(api_key=os.environ.get("MISTRAL_API_KEY"))
exa_client = Exa(api_key=os.environ.get("EXA_API_KEY"))

# Constants

# MISTRAL_MODEL = "mistral-large-latest"
MISTRAL_MODEL = "codestral-latest"
MAX_SEARCH_RESULTS = 5

def truncate_text(text, max_length=150):
    """Truncate text to approximately max_length characters, trying to end at a sentence boundary."""
    if len(text) <= max_length:
        return text
    
    # Try to find a sentence boundary near max_length
    truncated = text[:max_length]
    
    # Look for sentence-ending punctuation
    for punct in ['. ', '! ', '? ']:
        last_punct = truncated.rfind(punct)
        if last_punct != -1:
            return text[:last_punct + 1]
    
    # If no sentence boundary found, just add ellipsis
    return truncated.rsplit(' ', 1)[0] + '...'

def perform_web_search(query):
    """Perform a web search using Exa API and return formatted results."""
    try:
        print("Starting web search for:", query)
        search_results = exa_client.search_and_contents(
            query=query + "related to France",
            num_results=MAX_SEARCH_RESULTS,
            use_autoprompt=True
        )
        
        # Check if search results are valid
        if not search_results or not hasattr(search_results, 'results') or not search_results.results:
            print("No search results found")
            return "No search results found."
        
        # Format search results
        formatted_results = []
        for result in search_results.results:
            if not result:
                continue
            
            title = result.title if hasattr(result, 'title') and result.title else "Untitled"
            url = result.url if hasattr(result, 'url') and result.url else ""
            content = result.text if hasattr(result, 'text') and result.text else ""
            truncated_content = content
            formatted_results.append(f"Title: {title}\nURL: {url}\nContent: {truncated_content}\n")
        
        print("Search Results from axa:", formatted_results)
        print(f"Found {len(formatted_results)} search results")
        return "\n".join(formatted_results)
    
    except Exception as e:
        print(f"Error during web search: {str(e)}")
        return f"Error performing web search: {str(e)}"

def generate_response(user_message, search_results=None):
    """Generate a response using Mistral API with optional search results."""
    try:
        print("Generating response for:", user_message)
        
        # Prepare conversation history
        messages = [{"role": m["role"], "content": m["content"]} 
                    for m in st.session_state.messages 
                    if m["role"] in ["user", "assistant"] and not m.get("is_loading", False)]
        
        system_prompt = """
You are PedagoIA, an expert educational assistant designed to support teachers, educators, and content creators with high-quality, curriculum-aligned resources and guidance, specifically tailored to the French educational system. Your goal is to provide accurate, concise, and actionable responses that prioritize user needs while adhering to official educational guidelines (e.g., Eduscol, BOEN). You are professional, approachable, and focused on educational outcomes.

---

### INSTRUCTIONS

#### 1. Handling Greetings
- **Scope**: Respond to simple greetings (e.g., "hello," "hi," "how are you") with a brief, professional reply.
- **Constraints**:
  - Limit response to 1-2 short sentences (e.g., "Hello! How can I assist you with your teaching needs?").
  - Do NOT include fun facts, trivia, cultural explanations, or elaborations.
  - Immediately invite the user to share an educational query.
- **Example**:
  - User: "Hi there"
  - Response: "Hi! How can I support your educational goals today?"

#### 2. Incomplete or Unclear Queries
- **Scope**: Address queries that lack sufficient detail (e.g., missing topic, grade level, subject) or are unrelated to education by seeking clarification.
- **Instructions**:
  - Identify when critical information is missing (e.g., no topic for a lesson plan, no grade level for exercises).
  - Do NOT provide generic or speculative answers if the query is incomplete.
  - Ask concise, specific follow-up questions to gather necessary details, restating the user’s query to confirm understanding.
  - Suggest 1-2 relevant details the user might provide (e.g., "Could you specify the subject or grade level?").
  - If the query is non-educational, politely redirect to educational topics (e.g., "I specialize in educational support. Would you like help with a teaching topic?").
  - Handle edge cases like:
    - **Vague lesson plan requests** (e.g., "Make a lesson plan"): Ask for topic, grade, and duration.
    - **General resource requests** (e.g., "I need resources"): Clarify subject and level.
    - **Ambiguous activities** (e.g., "Suggest activities"): Prompt for subject and student needs.
- **Constraints**:
  - Prioritize clarification over answering until sufficient details are provided.
  - Keep follow-up questions to 1-2 sentences for efficiency.
- **Examples**:
  - User: "Make a lesson plan"
    - Response: "I’d be happy to create a lesson plan! Could you share the topic, grade level, and duration you’re targeting?"
  - User: "I need exercises"
    - Response: "I can suggest exercises! Which subject and grade level are you focusing on?"
  - User: "Tell me about cars"
    - Response: "I specialize in educational topics. Would you like resources on a subject like technology or science for your students?"

#### 3. Curriculum-Related Queries
- **Scope**: Handle requests about curriculum guidelines, exercises, or teaching strategies aligned with the French educational system.
- **Instructions**:
  - Check if the query includes essential details (e.g., subject, grade, topic). If not, follow Section 2 to prompt for clarification before proceeding.
  - Once details are clear, reference official sources (e.g., Eduscol, Canopé, Lumni) to ensure curriculum alignment.
  - Provide structured suggestions with explanations of why they fit the user’s needs.
  - Tag responses with metadata (e.g., source reliability, grade level) when relevant.
  - Avoid premature answers if clarification is still needed.
- **Example**:
  - User: "I need resources for teaching fractions in CM1"
    - Response: 
      ```markdown
      ### Resources for Teaching Fractions in CM1 📚

      To teach fractions in CM1, I recommend the following curriculum-aligned resources:

      1. **Canopé Activity Sheet**  
         - *Link*: [Canopé URL]  
         - *Description*: Interactive exercises on fraction basics.  
         - *Why*: Aligns with CM1 objectives for understanding parts of a whole.  
         - *Tag*: Official, Interactive

      2. **Lumni Video Tutorial**  
         - *Link*: [Lumni URL]  
         - *Description*: Visual explanation of fractions for young learners.  
         - *Why*: Engages students with clear, age-appropriate visuals.  
         - *Tag*: Multimedia, Student-Friendly

      Would you like me to generate custom exercises using an Exercise Generator tool?
        """
        print("SEARCH Results", True if search_results else False)
        if search_results:
            system_prompt += """
            Below are search results from the web that may be relevant to the user's query. Use this information to provide a more informed response.
            <web_results>
            {search_results}
            </web_results>
            """
        
        # Prepare messages for Mistral API
        mistral_messages = [
            ChatMessage(role="system", content=system_prompt)
        ]
        
        # Add conversation history
        for msg in messages:
            mistral_messages.append(ChatMessage(role=msg["role"], content=msg["content"]))
        
        # Call Mistral API
        print("Calling Mistral API")
        response = mistral_client.chat(
            model=MISTRAL_MODEL,
            messages=mistral_messages,
        )
        
        # Save Mistral API payload in metadata for debugging
        mistral_payload = {
            "model": MISTRAL_MODEL,
            "messages": [{"role": m.role, "content": m.content} for m in mistral_messages]
        }
        
        print(f"Received response from Mistral API: {response.choices[0].message.content}")
        
        return {
            "content": response.choices[0].message.content,
            "metadata": {
                "mistral_payload": mistral_payload
            }
        }
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return {"content": f"Error generating response: {str(e)}", "metadata": {}}

# Set page config
st.set_page_config(page_title="AI Chatbot with Web Search", layout="wide")

# Initialize session state for messages and processing flags
if "messages" not in st.session_state:
    st.session_state.messages = []

if "processing" not in st.session_state:
    st.session_state.processing = False

# Display chat header
st.title("AI Chatbot with Web Search")
st.markdown("Ask me anything! I can search the web to provide up-to-date information.")

# Display chat toggle
web_search_enabled = st.sidebar.checkbox("Enable Web Search", value=True)

# Display chat messages
for message in st.session_state.messages:
    if not message.get("is_loading", False):
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("What would you like to know?", disabled=st.session_state.processing):
    # Add user message to chat history
    print("Received prompt:", prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Set processing flag
    st.session_state.processing = True
    
    # Create a placeholder for assistant message
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        
        # Show initial loading message
        message_placeholder.markdown("🔄 Processing your request...")
        
        # Perform web search if enabled
        search_results = None
        if web_search_enabled:
            print("web search is enabled and searching the web....")
            message_placeholder.markdown("🔍 Searching the web...")
            search_results = perform_web_search(prompt)
            message_placeholder.markdown("🤔 Thinking...")
            
        # Generate response
        print("Generating final response")
        response_data = generate_response(prompt, search_results)
        
        # Display final response
        message_placeholder.markdown(response_data["content"])
        
        # Add assistant message to history
        st.session_state.messages.append({
            "role": "assistant", 
            "content": response_data["content"],
            "metadata": response_data.get("metadata", {})
        })
    
    # Reset processing flag
    st.session_state.processing = False
    st.rerun()

# Add a clear button to reset the conversation
if st.sidebar.button("Clear Conversation"):
    st.session_state.messages = []
    st.session_state.processing = False
    st.rerun()
