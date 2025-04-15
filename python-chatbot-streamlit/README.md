# Python Chatbot with Streamlit, Exa Search and Mistral AI

This is a Streamlit application that provides a chat interface with web search capabilities using Exa Search API and Mistral AI for generating responses.

## Features

- Chat interface built with Streamlit
- Web search functionality using Exa Search API
- AI responses powered by Mistral AI
- Toggle to enable/disable web search
- Clear conversation button
- Proper loading indicators during search and response generation

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```
4. Add your API keys to the `.env` file:
   ```
   MISTRAL_API_KEY=your_mistral_api_key_here
   EXA_API_KEY=your_exa_api_key_here
   ```

## Running the Application

Run the Streamlit application with:

```
streamlit run app/main.py
```

The application will be available at http://localhost:8501 by default.

## How It Works

1. User enters a query in the chat interface
2. If web search is enabled, the application searches the web using Exa Search API
3. The search results are formatted and included in the system prompt for Mistral AI
4. Mistral AI generates a response based on the user query and search results
5. The response is displayed in the chat interface

## Notes

- The application saves the Mistral API payload in the message metadata for debugging purposes
- Web search results are truncated to approximately 150 characters per result
- The application handles errors gracefully during both search and response generation
