
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator";

export default function CorrespondencePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center pt-4 pb-4">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
          Générateur de correspondances
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Qu'allons nous rédiger aujourd'hui ?</p>
      </div>
      <CorrespondenceGenerator />
    </div>
  );
}
