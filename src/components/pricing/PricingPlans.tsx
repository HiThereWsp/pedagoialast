import { PricingCard } from "@/components/pricing/PricingCard";
import { pricingEvents } from "@/integrations/posthog/events";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Price IDs for the plans production
const priceIDs = {
    yearly : "price_1R224CIqXQKnGj4myOb4EnXo",
    monthly: "price_1R224HIqXQKnGj4mw1Zc41s1",
};
const productIDs = {
    yearly : "prod_RvtrB9qvvdbA94",
    monthly: "prod_RvtsYiu8kK3Nlc",
};

// Dev test product Ids test mode

// const priceIDs = {
//     yearly : "price_1R1zqKIqXQKnGj4mgi0nXbaK",
//     monthly: "price_1R1zloIqXQKnGj4mbfg3CG2p",
// };
// const productIDs = {
//     yearly : "prod_RvrZPHTHWWrz7v",
//     monthly: "prod_RvrU5SPaCAWh5T",
// };
interface PricingPlansProps {
    isSubscribed: boolean;
    subscriptionType: string | null;
    isLoading: boolean;
    onSchoolContactRequest: () => void;
}

export const PricingPlans = ({
                                 isSubscribed,
                                 subscriptionType,
                                 isLoading,
                                 onSchoolContactRequest
                             }: PricingPlansProps) => {
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

        // Call the Supabase Edge Function to create a Stripe Checkout Session
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const {data, error} = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId: priceIDs.monthly,
                    subscriptionType: "monthly",
                    productId: productIDs.monthly, // Replace with your actual product ID
                    testMode: import.meta.env.DEV, // Use test mode in development
                }})


            // const data = await response.json();

            if (error) {
                throw new Error(data.error);
            }

            // Redirect to the Stripe Checkout Session URL
            window.location.href = data.url;
        } catch (error) {
            toast.error("Erreur lors de la création de la session de paiement", {
                description: error.message,
            });
        }
    };

    const handleYearlySubscription = async () => {
        if (!await checkAuth()) return;

        // Tracking PostHog
        pricingEvents.selectPlan('premium');
        subscriptionEvents.subscriptionStarted('yearly', 9.90);

        // Tracking Facebook
        facebookEvents.initiateCheckout('yearly', 9.00);

        // Redirection directe vers le checkout avec le code promo déjà appliqué
        window.location.href = "https://checkout.stripe.com/c/pay/cs_live_b1ImBUC9LMUcyCxeZklBiMufFBhNOUh7FwoTQeVexulvk2qDRqIKERGO0i";
    };

    // Texte du bouton selon l'état de l'abonnement
    const getButtonText = (planType) => {
        if (isLoading) return "Chargement...";

        if (isSubscribed) {
            if (subscriptionType === planType ||
                (subscriptionType === 'yearly' && planType === 'monthly')) {
                return "Déjà abonné";
            }
            return planType === 'yearly' ? "Passer à l'annuel" : "Changer de formule";
        }

        return "Démarrer l'essai gratuit";
    };

    // Modification: Ne pas désactiver les boutons en mode dev pour des tests
    const isButtonDisabled = (planType) => {
        // En environnement de développement, permettre toujours les clics
        if (import.meta.env.DEV) {
            return false;
        }

        // En production, utiliser la logique standard
        return isSubscribed && subscriptionType === planType;
    };

    return (
        <>
            {isSubscribed && (
                <div className="max-w-3xl mx-auto mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-center text-blue-800">
                        Vous êtes déjà abonné au plan {subscriptionType === 'yearly' ? 'annuel' : 'mensuel'}.
                        {subscriptionType === 'monthly' && (
                            <span> Vous pouvez passer au plan annuel pour économiser 2 mois d'abonnement.</span>
                        )}
                    </p>
                </div>
            )}
            
            {/* Section des plans individuels */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto mb-16">
                <PricingCard
                    title="Plan mensuel"
                    price="11,90€"
                    period="/mois"
                    features={[
                        "Accès à plus de 10 outils pédagogiques pensés pour chaque étape de la préparation de classe",
                        "Création instantanée de séquences, séances, évaluations, images, cartes mentales, dictées et plus encore",
                        "Sauvegarde illimitée de tous les supports générés",
                        "Utilisation sans limite de tous les outils, à tout moment",
                        "Plus de 14h de travail économisées chaque semaine grâce à l'IA",
                        "Organisation centralisée de ses contenus pédagogiques",
                        "Interface pensée pour une prise en main rapide, sans formation nécessaire",
                        "Support prioritaire en cas de besoin",
                        "Sans engagement – résiliable à tout moment"
                    ]}
                    ctaText={getButtonText('monthly')}
                    onSubscribe={handleMonthlySubscription}
                    disabled={isButtonDisabled('monthly')}
                />
                <PricingCard
                    title="Plan annuel"
                    price="71,40€"
                    originalPrice="142,80€"
                    badge="En ce moment -40%"
                    isPremium
                    features={[
                        "Tous les avantages du plan mensuel inclus, et en plus :",
                        "Participation exclusive aux votes pour les prochains outils",
                        "Accès en avant-première aux nouveautés et évolutions de la plateforme",
                        "Intégration dans la communauté privée des enseignants 3.0",
                        "Priorité sur les suggestions de fonctionnalités personnalisées",
                        "Accès à des contenus exclusifs chaque mois (fiches prêtes à l'emploi, ressources, astuces IA)",
                        "Bonus de productivité : outils expérimentaux et fonctionnalités anticipées testables en priorité",
                        "Réduction de plus de 5 mois de paiement – investissement optimisé à long terme",
                        "Tranquillité pour l'année entière, sans renouvellement mensuel à gérer"
                    ]}
                    ctaText={getButtonText('yearly')}
                    onSubscribe={handleYearlySubscription}
                    disabled={isButtonDisabled('yearly')}
                />
            </div>
            
            {/* Séparateur */}
            <div className="max-w-3xl mx-auto mb-16 text-center">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px bg-border flex-1"></div>
                    <h3 className="text-xl font-semibold text-muted-foreground">Pour les établissements</h3>
                    <div className="h-px bg-border flex-1"></div>
                </div>
            </div>
            
            {/* Section pour établissement scolaire */}
            <div className="max-w-lg mx-auto mb-20">
                <PricingCard
                    title="Établissement scolaire"
                    price="Offre sur mesure"
                    features={[
                        "Tous les avantages du plan annuel pour chaque enseignant de l'équipe",
                        "Outils pédagogiques adaptés à vos priorités (projet d'établissement, évaluations, différenciation…)",
                        "Création de modules sur demande : outils spécifiques à vos pratiques ou besoins collectifs",
                        "Tableau de bord de suivi pour la direction : usages, impacts, progression",
                        "Accompagnement personnalisé à la mise en œuvre pédagogique de l'IA",
                        "Intégration possible dans la stratégie numérique de votre établissement",
                        "Devis adapté selon la taille de l'équipe et les objectifs",
                        "Solution dédiée aux établissements publics, privés ou associatifs"
                    ]}
                    ctaText="Prendre contact"
                    onSubscribe={onSchoolContactRequest}
                />
            </div>
        </>
    );
};