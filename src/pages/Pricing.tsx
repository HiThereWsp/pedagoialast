import { MessageSquareText, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PricingCard } from "@/components/pricing/PricingCard"
import { QualityFeatures } from "@/components/pricing/QualityFeatures"
import { handleSubscription } from "@/utils/subscription"

const PricingPage = () => {
  const handleMonthlySubscription = () => {
    handleSubscription('price_1QYUKDIqXQKnGj4mKGx80HJP')
  }

  const handleYearlySubscription = () => {
    handleSubscription('price_1QYUKAIqXQKnGj4meN7G9nPH')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Découvrez la puissance de l'intelligence artificielle dans votre métier grâce à PedagoIA
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Des outils d'IA adaptés à vos besoins, avec un accès illimité à notre assistant intelligent
          </p>
          <Badge variant="secondary" className="mb-4 bg-secondary text-primary">
            <MessageSquareText className="w-4 h-4 mr-1" />
            Essai gratuit de 7 jours
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Plan Mensuel"
            price="7,99€"
            period="/mois"
            badge="Plan Flexible"
            badgeIcon={<MessageSquareText className="w-4 h-4 mr-1" />}
            features={[
              "Accès illimité à Élia (assistant IA)",
              "Génération de contenus pédagogiques",
              "Sauvegarde de vos documents",
              "Support client prioritaire",
              "+ 10h économisées/semaine",
            ]}
            ctaText="Commencer l'essai gratuit"
            onSubscribe={handleMonthlySubscription}
          />

          <PricingCard
            title="Plan Annuel"
            price="59,99€"
            period="/an"
            yearlyPrice="5€/mois"
            badge="Meilleure offre"
            badgeIcon={<Crown className="w-4 h-4 mr-1" />}
            isPremium
            features={[
              "Tous les avantages du plan mensuel",
              "Prix réduit garanti à vie (-35€/an)",
              "Accès prioritaire aux nouvelles fonctionnalités",
              "Stockage plus élevé de l'historique",
              "Support client téléphonique",
              { 
                text: "Garantie satisfait ou remboursé",
                tooltip: "Remboursement intégral pendant les 30 premiers jours"
              },
              "Badge 'Membre Premium' dans la communauté",
              "Vote prioritaire sur les futures fonctionnalités"
            ]}
            ctaText="Souscrire à l'offre annuelle"
            onSubscribe={handleYearlySubscription}
          />
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h4 className="font-semibold mb-8 text-primary">Notre engagement qualité</h4>
          <QualityFeatures />
        </div>
      </main>
    </div>
  )
}

export default PricingPage