import { SEO } from "@/components/SEO"
import { ImageGenerator } from "@/components/image-generation/ImageGenerator"

export default function ImageGenerationPage() {
  return (
    <>
      <SEO 
        title="Génération d'images | PedagoIA"
        description="Générez des images pour vos contenus pédagogiques avec PedagoIA"
      />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Générateur d'images</h1>
        <ImageGenerator />
      </div>
    </>
  )
}