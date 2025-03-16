
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator";
import { useIsMobile } from '@/hooks/use-mobile';

export default function CorrespondencePage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center pt-4 pb-4">
        <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent leading-tight tracking-tight text-balance`}>
          <span className="underline decoration-dashed underline-offset-4">Générateur</span> de correspondances
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Qu'allons nous rédiger aujourd'hui ?</p>
      </div>
      <CorrespondenceGenerator />
    </div>
  );
}
