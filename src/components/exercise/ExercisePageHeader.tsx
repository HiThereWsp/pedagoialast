
import { useIsMobile } from '@/hooks/use-mobile';

export function ExercisePageHeader() {
  const isMobile = useIsMobile();
  
  return (
    <div className="text-center mb-8">
      <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold mb-2 bg-gradient-to-r from-[#F97316] to-[#FF8E7C] bg-clip-text text-transparent tracking-tight text-balance`}>
        <span className="rotate-1 inline-block">Générateur</span> <span className="-rotate-1 inline-block">d'exercices</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-lg mx-auto">
        Créez des exercices adaptés à vos besoins pédagogiques
      </p>
    </div>
  );
}
