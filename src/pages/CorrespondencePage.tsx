
import { Link } from "react-router-dom"
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator"
import { SEO } from "@/components/SEO"

export default function CorrespondencePage() {
  return (
    <>
      <SEO 
        title="Générateur de correspondances | PedagoIA - Communications professionnelles"
        description="Créez des correspondances professionnelles pour communiquer efficacement avec les parents d'élèves, la direction et vos collègues."
      />
      <div className="container mx-auto py-8">
        <Link to="/home" className="block mb-8">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto" 
          />
        </Link>
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
            Générateur de correspondances
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez facilement des correspondances professionnelles pour communiquer avec les parents d'élèves, la direction et vos collègues.
          </p>
        </div>
        <CorrespondenceGenerator />
      </div>
    </>
  )
}

