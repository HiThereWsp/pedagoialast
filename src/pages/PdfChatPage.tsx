import { SEO } from "@/components/SEO"
import { PdfUploader } from "@/components/pdf-chat/PdfUploader"

export default function PdfChatPage() {
  return (
    <>
      <SEO 
        title="Chat avec PDF | PedagoIA"
        description="Téléchargez un document PDF et discutez avec son contenu"
      />
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Chat avec PDF
        </h1>
        <PdfUploader />
      </div>
    </>
  )
}