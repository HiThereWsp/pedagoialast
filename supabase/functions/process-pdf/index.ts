import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFLoader } from "https://esm.sh/langchain/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "https://esm.sh/langchain/text_splitter"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()

    if (!documentId) {
      throw new Error('Document ID is required')
    }

    console.log(`Processing document: ${documentId}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      throw new Error('Document not found')
    }

    // Get file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('lesson-documents')
      .download(document.file_path)

    if (fileError) {
      throw new Error('Failed to download file')
    }

    // Load PDF and extract text
    const loader = new PDFLoader(fileData)
    const pages = await loader.load()

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const chunks = await textSplitter.splitDocuments(pages)

    console.log(`Created ${chunks.length} chunks from document`)

    // Create embeddings for each chunk
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found')
    }

    const embeddingRequests = chunks.map(async (chunk, index) => {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: chunk.pageContent,
          model: "text-embedding-ada-002"
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create embedding for chunk ${index}`)
      }

      const { data } = await response.json()
      
      return {
        document_id: documentId,
        page_number: chunk.metadata.page || 1,
        content: chunk.pageContent,
        embedding: data[0].embedding
      }
    })

    const embeddings = await Promise.all(embeddingRequests)
    console.log(`Created ${embeddings.length} embeddings`)

    // Store embeddings in database
    const { error: insertError } = await supabase
      .from('pdf_embeddings')
      .insert(embeddings)

    if (insertError) {
      throw new Error('Failed to store embeddings')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully',
        chunks: chunks.length,
        embeddings: embeddings.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing document:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})