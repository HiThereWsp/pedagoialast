
import { SEO } from "@/components/SEO";
import { ImageGenerator } from "@/components/image-generation/ImageGenerator";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useImageContent } from "@/hooks/content/useImageContent";
import type { SavedContent } from "@/types/saved-content";
import { ImageGrid } from "@/components/image-generation/ImageGrid";
import { Tiles } from "@/components/ui/tiles";

export default function ImageGenerationPage() {
  const [images, setImages] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getSavedImages } = useImageContent();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await getSavedImages();
        setImages(fetchedImages);
      } catch (error) {
        console.error('Erreur lors du chargement des images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [getSavedImages]);

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

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Mes images générées</h2>
            <ImageGrid images={images} />
          </div>
        </div>
      </div>
    </>
  );
}
