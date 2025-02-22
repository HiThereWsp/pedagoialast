
import { Link } from "react-router-dom";
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator";
import { SEO } from "@/components/SEO";
import { Tiles } from "@/components/ui/tiles";

export default function CorrespondencePage() {
  return (
    <>
      <SEO 
        title="Générateur de correspondances | PedagoIA - Communications professionnelles" 
        description="Créez des correspondances professionnelles pour communiquer efficacement avec les parents d'élèves, la direction et vos collègues." 
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
          <div className="flex items-center gap-4 justify-center mb-8">
            <Link to="/home">
              <img 
                src="/lovable-uploads/052bcdf3-b137-4ccc-a686-c007a1be69be.png" 
                alt="PedagoIA Logo" 
                className="w-[100px] h-[100px] object-contain" 
              />
            </Link>
          </div>
          <div className="text-center pt-4 pb-4">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
              Générateur de correspondances
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Qu'allons nous rédiger aujourd'hui ?</p>
          </div>
          <CorrespondenceGenerator />
        </div>
      </div>
    </>
  );
}
