
import { SEO } from "@/components/SEO"
import { OfflineChatUI } from "@/components/offline-chat/OfflineChatUI"

const OfflineChatPage = () => {
  return (
    <>
      <SEO 
        title="Assistant pédagogique local - PedagoIA"
        description="Discutez avec l'assistant pédagogique même sans connexion internet"
      />
      <div className="container mx-auto max-w-4xl">
        <OfflineChatUI />
      </div>
    </>
  )
}

export default OfflineChatPage
