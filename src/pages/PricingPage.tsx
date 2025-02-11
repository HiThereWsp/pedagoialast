
import { PricingCard } from "@/components/pricing/PricingCard"
import { PricingFormDialog } from "@/components/pricing/PricingFormDialog"
import { useEffect } from "react"
import { pricingEvents } from "@/integrations/posthog/events"

const PricingPage = () => {
  useEffect(() => {
    pricingEvents.viewPricing()
  }, [])

  const handleMonthlySubscription = () => {
    pricingEvents.selectPlan('premium')
    window.location.href = 'https://buy.stripe.com/14k3fuggO8Md9gY3ce'
  }

  const handleYearlySubscription = () => {
    pricingEvents.selectPlan('premium')
    window.location.href = 'https://buy.stripe.com/fZe03i3u20fHdxe4gj'
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            La magie de l'IA
          </h1>
          <p className="text-3xl bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-semibold mb-6">
            au service de l'enseignement
          </p>
          <p className="text-xl text-muted-foreground">
            Choisissez le plan qui vous convient le mieux
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <PricingCard
            title="Plan mensuel"
            price="11,90€"
            period="/mois"
            features={[
              "Accès illimité à l'assistant pédagogique via le chat",
              "Accéder à plus de 10 outils IA pédagogiques",
              "Sauvegarde de tous vos supports de cours générés",
              "Utilisation illimitée de tous les outils",
              "+14h économisées /semaine"
            ]}
            ctaText="Découvrir l'assistant maintenant"
            onSubscribe={handleMonthlySubscription}
          />
          <PricingCard
            title="Plan annuel"
            price="9€"
            period="/mois"
            badge="3 mois gratuits offerts"
            isPremium
            features={[
              "Tous les avantages du plan mensuel",
              "Vote prioritaire pour de nouvelles fonctionnalités",
              "Recevez les mises à jour à l'avance",
              "Accès à la communauté privée d'enseignants 3.0"
            ]}
            ctaText="Profiter de l'offre spéciale"
            onSubscribe={handleYearlySubscription}
          />
          <PricingCard
            title="Établissement scolaire"
            price="Sur mesure"
            features={[
              "Tout ce qui est inclus dans le plan annuel et bien plus",
              "Créez des outils sur mesure",
              "Tableau de suivi pour la direction",
              "Des outils adaptés à votre projet pédagogique",
              "Un canal support dédié"
            ]}
            CustomCTA={<PricingFormDialog triggerText="Obtenir un tarif sur mesure" />}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <h3 className="font-semibold mb-2">Satisfaction garantie</h3>
            <p className="text-muted-foreground">3 jours satisfait ou remboursé</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Support client</h3>
            <p className="text-muted-foreground">Un support client 24/7</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Mises à jour régulières</h3>
            <p className="text-muted-foreground">Chaque mois une nouvelle fonctionnalité</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage
