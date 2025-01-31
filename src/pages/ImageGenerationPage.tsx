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
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl text-gray-400">?</span>
          </div>
          <p className="text-lg text-gray-600">Qu'est ce que l'on crée aujourd'hui ?</p>
        </div>

        <ImageGenerator />
      </div>
    </>
  )
}