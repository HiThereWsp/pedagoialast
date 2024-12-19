import { Button } from "@/components/ui/button"

export const HeroSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            [Titre Principal]
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            [Sous-titre explicatif]
          </p>
          <Button size="lg" className="font-semibold">
            Commencer maintenant
          </Button>
        </div>
      </div>
    </section>
  )
}