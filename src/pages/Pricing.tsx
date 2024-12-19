import { PricingSection } from "@/components/landing/PricingSection"

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-xl text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins. Changez ou annulez à tout moment.
          </p>
        </div>
        <PricingSection />
      </div>
    </div>
  )
}

export default Pricing