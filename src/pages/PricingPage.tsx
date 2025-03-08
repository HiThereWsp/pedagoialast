
import { PricingCard } from "@/components/pricing/PricingCard"
import { useEffect } from "react"
import { pricingEvents } from "@/integrations/posthog/events"
import { subscriptionEvents } from "@/integrations/posthog/events"
import { facebookEvents } from "@/integrations/meta-pixel/client"
import { SEO } from "@/components/SEO"
import { Shield, Clock, CreditCard } from "lucide-react"

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
    subscriptionEvents.subscriptionStarted('monthly', 11.90)
    
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
    subscriptionEvents.subscriptionStarted('yearly', 9.00)
    
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-grid-black pointer-events-none"></div>
      <SEO 
        title="PedagoIA - Offres d'abonnement"
        description="Choisissez l'offre qui vous convient pour bénéficier des outils pédagogiques IA qui vous feront gagner du temps."
      />
      <main className="container mx-auto px-4 py-16 relative z-10">
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
              "Accéder à l'assistant pédagogique via le chat sans limite",
              "Utiliser plus de 10 outils IA pédagogiques",
              "Sauvegarder tous vos supports de cours générés",
              "Exploiter tous les outils sans limitation",
              "Économiser plus de 14h par semaine grâce aux outils IA"
            ]}
            ctaText="Démarrer l'essai gratuit"
            onSubscribe={handleMonthlySubscription}
          />
          <PricingCard
            title="Plan annuel"
            price="94,20€"
            originalPrice="142,80€"
            badge="4 mois offerts"
            isPremium
            features={[
              "Bénéficier de tous les avantages du plan mensuel",
              "Voter de nouveaux outils tous les mois",
              "Recevoir les mises à jour en avant-première",
              "Accéder à la communauté privée d'enseignants 3.0"
            ]}
            ctaText="Démarrer l'essai gratuit"
            onSubscribe={handleYearlySubscription}
          />
          <PricingCard
            title="Établissement scolaire"
            price="Sur mesure"
            features={[
              "Bénéficier de tout ce qui est inclus dans le plan annuel",
              "Créer des outils personnalisés pour votre établissement",
              "Accéder au tableau de suivi pour la direction",
              "Adapter les outils à votre projet d'établissement"
            ]}
            ctaText="Prendre contact"
            onSubscribe={() => {}}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold mb-2">Essai gratuit de 3 jours</h3>
            <p className="text-sm text-muted-foreground">Testez toutes les fonctionnalités sans engagement</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-bold mb-2">Économisez du temps</h3>
            <p className="text-sm text-muted-foreground">Plus de 14h par semaine grâce à nos outils IA</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-bold mb-2">Annulation facile</h3>
            <p className="text-sm text-muted-foreground">Résiliez à tout moment sans frais cachés</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage
