import { useState, useEffect } from "react"
import { ChatHistory } from "@/components/ChatHistory"
import { ChatInput } from "@/components/ChatInput"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Document, Page, pdfjs } from 'react-pdf'
import { Box, Flex, Spinner, Text } from "@chakra-ui/react"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PdfChatProps {
  documentId: string
  title: string
}

export const PdfChat = ({ documentId, title }: PdfChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [numPages, setNumPages] = useState<number>(1)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const { data: document } = await supabase
          .from('pdf_documents')
          .select('file_path')
          .eq('id', documentId)
          .single()

        if (document) {
          const { data: { publicUrl } } = supabase.storage
            .from('lesson-documents')
            .getPublicUrl(document.file_path)
          
          setPdfUrl(publicUrl)
        }
      } catch (error) {
        console.error('Error fetching PDF:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le PDF."
        })
      }
    }

    fetchPdfUrl()
  }, [documentId, toast])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
      }
      
      setMessages(prev => [...prev, userMessage])

      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: { 
          message,
          documentId
        }
      })

      if (error) throw error

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error in PDF chat:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  return (
    <Flex h="calc(100vh - 100px)" gap={6} p={6}>
      {/* PDF Viewer */}
      <Box 
        flex="1" 
        overflowY="auto" 
        borderRadius="lg"
        bg="white"
        shadow="lg"
        p={4}
      >
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          {title}
        </Text>
        
        <Box 
          overflowY="auto" 
          maxH="full"
          css={{
            '& .react-pdf__Document': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Spinner />}
            error={<Text color="red.500">Erreur de chargement du PDF</Text>}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page 
                key={`page_${index + 1}`}
                pageNumber={index + 1} 
                width={450}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            ))}
          </Document>
        </Box>
      </Box>

      {/* Chat Interface */}
      <Flex 
        flex="1" 
        flexDirection="column" 
        borderRadius="lg"
        bg="white"
        shadow="lg"
        overflow="hidden"
      >
        <Box flex="1" overflowY="auto" px={4}>
          <ChatHistory messages={messages} isLoading={isLoading} />
        </Box>

        <Box p={4} borderTop="1px" borderColor="gray.200">
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Box>
      </Flex>
    </Flex>
  )
}