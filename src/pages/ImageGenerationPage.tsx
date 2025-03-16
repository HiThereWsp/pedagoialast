
import { SEO } from "@/components/SEO";
import { ImageGenerator } from "@/components/image-generation/ImageGenerator";
import { Link } from "react-router-dom";
import { Tiles } from "@/components/ui/tiles";

export default function ImageGenerationPage() {
  return (
    <>
      <SEO 
        title="Génération d'images | PedagoIA"
        description="Générez des images pour vos contenus pédagogiques avec PedagoIA"
      />
      <div className="relative min-h-screen">
        <div className="fixed inset-0 overflow-hidden">
          <Tiles 
            rows={50} 
            cols={8}
            tileSize="md"
            className="opacity-30"
          />
        </div>
        <div className="container mx-auto py-8 relative z-10">
          <Link to="/home" className="block mb-8">
            <img 
              src="/lovable-uploads/93d432b8-78fb-4807-ba55-719b6b6dc7ef.png" 
              alt="PedagoIA Logo" 
              className="w-[100px] h-[120px] object-contain mx-auto hover:scale-105 transition-transform duration-200" 
            />
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Générateur d'images</h1>
          </div>
          
          <ImageGenerator />
        </div>
      </div>
    </>
  );
}
