
import { ImageGenerator } from "@/components/image-generation/ImageGenerator";
import { useIsMobile } from '@/hooks/use-mobile';

export default function ImageGenerationPage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold leading-tight tracking-tight text-balance mb-2`}>
          Générateur d'images
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Créez des illustrations pertinentes pour vos cours et documents pédagogiques.
        </p>
      </div>
      
      <ImageGenerator />
    </div>
  );
}
