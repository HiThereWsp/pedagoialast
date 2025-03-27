
import { ImageGenerator } from "@/components/image-generation/ImageGenerator";
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';

export default function ImageGenerationPage() {
  const isMobile = useIsMobile();
  
  return (
    <>
      <SEO 
        title="Générateur d'images pédagogiques | PedagoIA"
        description="Créez des illustrations pertinentes pour vos cours et documents pédagogiques grâce à l'IA."
      />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold leading-tight tracking-tight text-balance mb-2 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent`}>
            <span className="rotate-1 inline-block">Générateur</span> <span className="-rotate-1 inline-block">d'images</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Créez des illustrations pertinentes pour vos cours et documents pédagogiques.
          </p>
        </div>
        
        <ImageGenerator />
      </div>
    </>
  );
}
