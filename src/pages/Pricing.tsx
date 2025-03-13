
import { PricingCard } from "@/components/pricing/PricingCard"
import { useEffect, useState } from "react"
import { pricingEvents } from "@/integrations/posthog/events"
import { subscriptionEvents } from "@/integrations/posthog/events"
import { SEO } from "@/components/SEO"
import { Shield, Clock, RefreshCw } from "lucide-react"
import { SparklesText } from "@/components/ui/sparkles-text"
import { PricingFormDialog } from "@/components/pricing/PricingFormDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PricingForm from "@/components/pricing/PricingForm"
import { useSubscription } from "@/hooks/useSubscription"

const Pricing = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { subscription } = useSubscription();
  
  useEffect(() => {
    // Tracking PostHog
    pricingEvents.viewPricing()
  }, [])

  const handleMonthlySubscription = () => {
    // Tracking PostHog
    pricingEvents.selectPlan('premium')
    subscriptionEvents.subscriptionStarted('monthly', 11.90)
  }

  const handleYearlySubscription = () => {
    // Tracking PostHog
    pricingEvents.selectPlan('premium')
    subscriptionEvents.subscriptionStarted('yearly', 9.90)
  }

  const handleSchoolContactRequest = () => {
    setShowContactDialog(true);
  }

  // Vérifier si l'utilisateur est déjà abonné pour adapter l'interface
  const isSubscribed = subscription && subscription.type === 'paid' && subscription.status === 'active';
  const isBetaTester = subscription && subscription.type === 'beta' && subscription.status === 'active';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-grid-black pointer-events-none"></div>
      <SEO 
        title="PedagoIA - Offres d'abonnement"
        description="Choisissez l'offre qui vous convient pour bénéficier des outils pédagogiques IA qui vous feront gagner du temps."
      />
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-5xl font-extrabold mb-4 leading-tight tracking-tight text-balance">
            <SparklesText 
              text="La magie de l'Intelligence Artificielle" 
              className="text-4xl sm:text-5xl font-extrabold mb-1"
              sparklesCount={15}
              colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
            />
            <div className="mt-2">au service de l'enseignement</div>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto mt-6">
            Choisissez le plan qui vous convient le mieux
          </p>
          
          {isBetaTester && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-200">
              <p className="font-medium">Vous bénéficiez de l'accès bêta gratuit jusqu'au 31 décembre 2024.</p>
              <p className="text-sm mt-1">Merci de votre confiance et de votre participation au développement de PedagoIA !</p>
            </div>
          )}
          
          {isSubscribed && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-green-700 border border-green-200">
              <p className="font-medium">Vous êtes actuellement abonné à notre offre premium.</p>
              <p className="text-sm mt-1">Merci pour votre confiance ! Vous avez accès à toutes les fonctionnalités.</p>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
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
            ctaText={isSubscribed ? "Abonnement actif" : "Démarrer l'essai gratuit"}
            onSubscribe={handleMonthlySubscription}
            disabled={isSubscribed || isBetaTester}
            priceId="price_1Omj7zBvGBk8R8kDBEpKPQoF"
          />
          <PricingCard
            title="Plan annuel"
            price="119€"
            originalPrice="142,80€"
            badge="2 mois offerts"
            isPremium
            features={[
              "Bénéficier de tous les avantages du plan mensuel",
              "Votez de nouveaux outils tous les mois",
              "Recevoir les mises à jour en avant-première",
              "Accéder à la communauté privée d'enseignants 3.0"
            ]}
            ctaText={isSubscribed ? "Abonnement actif" : "Démarrer l'essai gratuit"}
            onSubscribe={handleYearlySubscription}
            disabled={isSubscribed || isBetaTester}
            priceId="price_1OmjA6BvGBk8R8kDmzDsxRgE"
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
            onSubscribe={handleSchoolContactRequest}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md">
            <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <Shield className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg mb-3">Essai gratuit de 3 jours</h3>
            <p className="text-sm text-muted-foreground">Testez toutes les fonctionnalités sans engagement</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md">
            <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-5">
              <Clock className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-3">Économisez du temps</h3>
            <p className="text-sm text-muted-foreground">Plus de 14h par semaine grâce à nos outils IA</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md">
            <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
              <RefreshCw className="w-7 h-7 text-indigo-500" />
            </div>
            <h3 className="font-bold text-lg mb-3">Mises à jour régulières</h3>
            <p className="text-sm text-muted-foreground">Bénéficiez des dernières innovations pédagogiques en IA</p>
          </div>
        </div>
      </main>

      {/* Dialog pour le formulaire de contact établissement */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Demande d'information pour établissement scolaire
            </DialogTitle>
          </DialogHeader>
          <PricingForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Pricing
