
import { PricingCard } from "@/components/pricing/PricingCard"
import { useEffect } from "react"
import { pricingEvents } from "@/integrations/posthog/events"
import { subscriptionEvents } from "@/integrations/posthog/events"
import { facebookEvents } from "@/integrations/meta-pixel/client"
import { SEO } from "@/components/SEO"
import { Shield, Clock, RefreshCw } from "lucide-react"
import { handleSubscription } from "@/utils/subscription"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const PricingPage = () => {
  useEffect(() => {
    // Tracking PostHog
    pricingEvents.viewPricing()
    
    // Tracking Facebook
    facebookEvents.viewPricing()
  }, [])

  // Vérifier si l'utilisateur est connecté
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Veuillez vous connecter pour souscrire à un abonnement");
      window.location.href = '/login?redirect=/pricing';
      return false;
    }
    
    return true;
  };

  const handleMonthlySubscription = async () => {
    if (!await checkAuth()) return;
    
    // Tracking PostHog
    pricingEvents.selectPlan('premium');
    subscriptionEvents.subscriptionStarted('monthly', 11.90);
    
    // Tracking Facebook
    facebookEvents.initiateCheckout('monthly', 11.90);
    
    // Utiliser le système d'abonnement Stripe via notre fonction
    const stripeMonthlyPriceId = 'price_1O8GJRGJLmrCBLPXcfwxVP6b'; // ID de prix pour l'abonnement mensuel
    await handleSubscription(stripeMonthlyPriceId);
  }

  const handleYearlySubscription = async () => {
    if (!await checkAuth()) return;
    
    // Tracking PostHog
    pricingEvents.selectPlan('premium');
    subscriptionEvents.subscriptionStarted('yearly', 9.90);
    
    // Tracking Facebook
    facebookEvents.initiateCheckout('yearly', 9.00);
    
    // Utiliser le système d'abonnement Stripe via notre fonction
    const stripeYearlyPriceId = 'price_1O8GJvGJLmrCBLPXFvw6SHHn'; // ID de prix pour l'abonnement annuel
    await handleSubscription(stripeYearlyPriceId);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-grid-black pointer-events-none"></div>
      <SEO 
        title="PedagoIA - Offres d'abonnement"
        description="Choisissez l'offre qui vous convient pour bénéficier des outils pédagogiques IA qui vous feront gagner du temps."
      />
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight tracking-tight text-balance">
            La magie de l'IA
          </h1>
          <p className="text-3xl bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-semibold mb-8">
            au service de l'enseignement
          </p>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Choisissez le plan qui vous convient le mieux
          </p>
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
              "Votez de nouveaux outils tous les mois",
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
            onSubscribe={() => {
              window.location.href = '/contact?subject=Abonnement Établissement';
            }}
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
    </div>
  )
}

export default PricingPage
