import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator"

export default function CorrespondencePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
          Générateur de correspondances
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Créez facilement des correspondances professionnelles pour communiquer avec les parents d'élèves, la direction et vos collègues.
        </p>
      </div>
      <CorrespondenceGenerator />
    </div>
  )
}