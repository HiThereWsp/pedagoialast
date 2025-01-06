import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator"

export default function CorrespondencePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Générateur de correspondances</h1>
        <p className="text-muted-foreground">
          Créez facilement des correspondances professionnelles pour communiquer avec les parents d'élèves.
        </p>
      </div>
      <CorrespondenceGenerator />
    </div>
  )
}