import { PricingCard } from "@/components/pricing/PricingCard"
import { useEffect, useState } from "react"
import { pricingEvents } from "@/integrations/posthog/events"
import { subscriptionEvents } from "@/integrations/posthog/events"
import { facebookEvents } from "@/integrations/meta-pixel/client" // Add this import
import { SEO } from "@/components/SEO"
import { Shield, Clock, RefreshCw, Tag } from "lucide-react"
import { SparklesText } from "@/components/ui/sparkles-text"
import { PricingFormDialog } from "@/components/pricing/PricingFormDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PricingForm from "@/components/pricing/PricingForm"
import { handleSubscription } from "@/utils/subscription"
import { useSubscription } from "@/hooks/useSubscription"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { usePromoCode } from "@/components/landing/pricing/usePromoCode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"

const Pricing = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [manualPromoCode, setManualPromoCode] = useState("");
  const { isSubscribed, subscriptionType, isLoading } = useSubscription();
  const autoPromoCode = usePromoCode();
  
  // Combiner le code promo automatique et manuel
  const [currentPromoCode, setCurrentPromoCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Si un code promo est détecté automatiquement, l'utiliser par défaut
    if (autoPromoCode) {
      setCurrentPromoCode(autoPromoCode);
    }
  }, [autoPromoCode]);
  
  useEffect(() => {
    // Tracking PostHog
    pricingEvents.viewPricing()
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
    
    // Utiliser le code promo s'il existe
    handleSubscription('monthly', currentPromoCode);
  }

  const handleYearlySubscription = async () => {
    if (!await checkAuth()) return;
    
    // Tracking PostHog
    pricingEvents.selectPlan('premium');
    subscriptionEvents.subscriptionStarted('yearly', 9.90);
    
    // Tracking Facebook
    facebookEvents.initiateCheckout('yearly', 9.00);
    
    // Utiliser le code promo s'il existe
    handleSubscription('yearly', currentPromoCode);
  }

  const handleSchoolContactRequest = () => {
    setShowContactDialog(true);
  }

  const applyPromoCode = () => {
    if (manualPromoCode.trim()) {
      setCurrentPromoCode(manualPromoCode.trim().toUpperCase());
      toast.success(`Code promo "${manualPromoCode.trim().toUpperCase()}" appliqué!`);
      
      // Tracking
      try {
        pricingEvents.applyPromoCode(manualPromoCode.trim().toUpperCase());
      } catch (e) {
        console.error("Erreur lors du tracking du code promo:", e);
      }
    }
  }

  // Texte du bouton selon l'état de l'abonnement
  const getButtonText = (planType) => {
    if (isLoading) return "Chargement...";
    
    if (isSubscribed) {
      if (subscriptionType === planType || 
         (subscriptionType === 'yearly' && planType === 'monthly')) {
        return "Votre abonnement actuel";
      }
      return planType === 'yearly' ? "Passer à l'annuel" : "Changer de formule";
    }
    
    return "Démarrer l'essai gratuit";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black opacity-10 pointer-events-none"></div>
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
              colors={{ first: "#9E7AFF", second: "#D946EF" }}
            />
            <div className="mt-2">au service de l'enseignement</div>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto mt-6">
            Choisissez le plan qui vous convient le mieux
          </p>
          
          {/* Section code promo */}
          <div className="mt-8 max-w-xs mx-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {currentPromoCode ? `Code promo: ${currentPromoCode}` : "Ajouter un code promo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium text-center">Code Promo</h3>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Entrez votre code" 
                      value={manualPromoCode}
                      onChange={(e) => setManualPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={applyPromoCode}>Appliquer</Button>
                  </div>
                  {currentPromoCode && (
                    <p className="text-xs text-muted-foreground text-center">
                      Code promo actif: <span className="font-semibold text-primary">{currentPromoCode}</span>
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
          <PricingCard
            title="Plan mensuel"
            price="11,90€"
            period="/mois"
            features={[
              "Accédez à l'assistant pédagogique via le chat sans limite",
              "Utilisez plus de 10 outils pédagogiques",
              "Sauvegardez tous vos supports de cours générés",
              "Exploitez tous les outils sans limitation",
              "Économisez plus de 14h par semaine grâce aux outils IA"
            ]}
            ctaText={getButtonText('monthly')}
            onSubscribe={handleMonthlySubscription}
            disabled={isSubscribed && subscriptionType === 'monthly'}
          />
          <PricingCard
            title="Plan annuel"
            price="119€"
            originalPrice="142,80€"
            badge="2 mois offerts"
            isPremium
            features={[
              "Bénéficiez de tous les avantages du plan mensuel",
              "Votez pour de nouveaux outils tous les mois",
              "Recevez les mises à jour en avant-première",
              "Accédez à la communauté privée d'enseignants 3.0"
            ]}
            ctaText={getButtonText('yearly')}
            onSubscribe={handleYearlySubscription}
            disabled={isSubscribed && subscriptionType === 'yearly'}
          />
          <PricingCard
            title="Établissement scolaire"
            price="Sur mesure"
            features={[
              "Bénéficiez de tout ce qui est inclus dans le plan annuel",
              "Créez des outils personnalisés pour votre établissement",
              "Accédez au tableau de suivi pour la direction",
              "Adaptez les outils à votre projet d'établissement"
            ]}
            ctaText="Prendre contact"
            onSubscribe={handleSchoolContactRequest}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <Shield className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg mb-3">Essai gratuit de 3 jours</h3>
            <p className="text-sm text-muted-foreground">Testez toutes les fonctionnalités sans engagement</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-5">
              <Clock className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-3">Économisez du temps</h3>
            <p className="text-sm text-muted-foreground">Plus de 14h par semaine grâce à nos outils IA</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
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
  );
}

export default Pricing;
