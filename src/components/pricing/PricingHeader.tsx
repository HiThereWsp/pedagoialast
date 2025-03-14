
import { SparklesText } from "@/components/ui/sparkles-text";

export const PricingHeader = () => {
  return (
    <div className="max-w-3xl mx-auto text-center mb-16">
      <div className="text-5xl font-extrabold mb-4 leading-tight tracking-tight text-balance">
        <SparklesText 
          text="La magie de l'Intelligence Artificielle" 
          className="text-4xl sm:text-5xl font-extrabold mb-1"
          sparklesCount={15}
          colors={{ first: "#9E7AFF", second: "#D946EF" }}
        />
        <div className="mt-2">au service de l'enseignement</div>
      </div>
      <p className="text-xl text-muted-foreground max-w-lg mx-auto mt-6">
        Choisissez le plan qui vous convient le mieux
      </p>
    </div>
  );
};
