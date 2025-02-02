import { useState, useEffect } from "react"
import { ChatHistory } from "@/components/ChatHistory"
import { ChatInput } from "@/components/ChatInput"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

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
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6">
      <div className="flex-1 overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          {title}
        </h2>
        
        <div className="max-h-full overflow-y-auto">
          <div className="flex flex-col items-center gap-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
              error={<div className="text-red-500">Erreur de chargement du PDF</div>}
              className="flex flex-col items-center gap-4"
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
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-lg bg-white shadow-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4">
          <ChatHistory messages={messages} isLoading={isLoading} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}