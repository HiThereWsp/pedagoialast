
import { SEO } from "@/components/SEO"
import { ImageGenerator } from "@/components/image-generation/ImageGenerator"
import { Image } from "lucide-react"
import { BackButton } from "@/components/settings/BackButton"
import { ContentHistory } from "@/components/history/ContentHistory"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { SavedContent } from "@/types/saved-content"

export default function ImageGenerationPage() {
  const [images, setImages] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('image_generation_usage')
          .select('*')
          .order('generated_at', { ascending: false });

        if (error) throw error;

        // Transformer les données pour correspondre au type SavedContent
        const formattedImages = data.map(img => ({
          id: img.id,
          title: img.prompt,
          content: img.image_url,
          type: 'Image',
          created_at: img.generated_at
        }));

        setImages(formattedImages);
      } catch (error) {
        console.error('Erreur lors du chargement des images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <>
      <SEO 
        title="Génération d'images | PedagoIA"
        description="Générez des images pour vos contenus pédagogiques avec PedagoIA"
      />
      <div className="container mx-auto py-8">
        <BackButton />
        
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold">Générateur d'images</h1>
        </div>
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FEF7CD] via-[#FFDEE2] to-[#FEC6A1] flex items-center justify-center">
            <Image className="w-10 h-10 text-[#F97316] animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">Qu'est ce que l'on crée aujourd'hui ?</p>
        </div>

        <ContentHistory
          title="Mes images générées"
          type="Image"
          items={images}
          emptyMessage="Votre galerie d'images est vide pour le moment. Générez votre première illustration pédagogique !"
          colorScheme={{
            color: '#F2FCE2',
            backgroundColor: '#F2FCE220',
            borderColor: '#F2FCE24D'
          }}
        />

        <ImageGenerator />
      </div>
    </>
  );
}
