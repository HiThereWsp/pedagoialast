
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator";
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';

export default function CorrespondencePage() {
  const isMobile = useIsMobile();
  
  return (
    <>
      <SEO 
        title="Générateur de correspondances administratives | PedagoIA"
        description="Rédigez des courriers et emails professionnels pour votre établissement grâce à l'IA."
      />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center pt-4 pb-4">
          <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold mb-2 tracking-tight text-balance`}>
            <span className="bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent rotate-1 inline-block">Générateur</span>{' '}
            <span className="bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent -rotate-1 inline-block">de correspondances</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Qu'allons nous rédiger aujourd'hui ?</p>
        </div>
        <CorrespondenceGenerator />
      </div>
    </>
  );
}
