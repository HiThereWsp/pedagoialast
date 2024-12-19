import { Button } from "@/components/ui/button"

export const CTASection = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à commencer ?</h2>
        <p className="text-xl mb-8 opacity-90">
          Rejoignez des milliers d'enseignants qui utilisent déjà notre solution
        </p>
        <Button size="lg" variant="secondary" className="font-semibold">
          S'inscrire gratuitement
        </Button>
      </div>
    </section>
  )
}