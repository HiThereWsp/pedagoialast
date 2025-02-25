
import { PricingCard } from "@/components/pricing/PricingCard"
import { PricingFormDialog } from "@/components/pricing/PricingFormDialog"
import { useEffect } from "react"
import { pricingEvents } from "@/integrations/posthog/events"
import { facebookEvents } from "@/integrations/meta-pixel/client"
import { SEO } from "@/components/SEO"

const PricingPage = () => {
  useEffect(() => {
    // Tracking PostHog
    pricingEvents.viewPricing()
    
    // Tracking Facebook
    facebookEvents.viewPricing()
  }, [])

  const handleMonthlySubscription = () => {
    // Tracking PostHog
    pricingEvents.selectPlan('premium')
    
    // Tracking Facebook - Prix: 11.90€
    facebookEvents.initiateCheckout('monthly', 11.90)
    
    // URLs de redirection Stripe
    const successUrl = `${window.location.origin}/subscription-success?type=monthly`
    const cancelUrl = `${window.location.origin}/checkout-canceled?type=monthly`
    const failedUrl = `${window.location.origin}/subscription-failed?type=monthly`
    
    // Redirect vers Stripe avec parametres de callback
    // Note: Pour l'exemple, on utilise les URL directes, mais idéalement il faudrait 
    // configurer ces URL dans Stripe et ajouter les paramètres via query params
    window.location.href = 'https://buy.stripe.com/14k3fuggO8Md9gY3ce'
  }

  const handleYearlySubscription = () => {
    // Tracking PostHog
    pricingEvents.selectPlan('premium')
    
    // Tracking Facebook - Prix: 9.00€/mois (équivalent)
    facebookEvents.initiateCheckout('yearly', 9.00)
    
    // URLs de redirection Stripe
    const successUrl = `${window.location.origin}/subscription-success?type=yearly`
    const cancelUrl = `${window.location.origin}/checkout-canceled?type=yearly`
    const failedUrl = `${window.location.origin}/subscription-failed?type=yearly`
    
    // Redirect vers Stripe avec parametres de callback
    window.location.href = 'https://buy.stripe.com/fZe03i3u20fHdxe4gj'
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="PedagoIA - Offres d'abonnement"
        description="Choisissez l'offre qui vous convient pour bénéficier des outils pédagogiques IA qui vous feront gagner du temps."
      />
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
              "Des outils adaptés à votre projet d'établissement"
            ]}
            ctaText="Demander un devis"
            onSubscribe={() => {}}
            withDialog
          />
        </div>
        <PricingFormDialog />
      </main>
    </div>
  )
}

export default PricingPage
