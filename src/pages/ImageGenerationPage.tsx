
import { ImageGenerator } from "@/components/image-generation/ImageGenerator";

export default function ImageGenerationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Générateur d'images</h1>
      </div>
      
      <ImageGenerator />
    </div>
  );
}
