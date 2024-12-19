import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Info, MessageSquareText, Shield, Sparkles, Star, Timer, Trophy } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"

const PricingPage = () => {
  const navigate = useNavigate()

  const handleStartTrial = () => {
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEF7CD]/30 to-[#FFDEE2]/20">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-yellow-400/20 to-coral-400/20 text-primary">
            <Sparkles className="w-4 h-4 mr-1" />
            Essai gratuit de 7 jours
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Découvrez la puissance de
            <span className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 bg-clip-text text-transparent">
              Pédagoia
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Testez toutes les fonctionnalités pendant 7 jours, sans engagement
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-coral-400" />
            <span>Pas de carte bancaire requise pour l'essai</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Mensuel */}
          <Card className="p-8 relative hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400/20 to-coral-400/20 text-primary">
                <MessageSquareText className="w-4 h-4 mr-1" />
                Plan Flexible
              </Badge>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Mensuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 bg-clip-text text-transparent">8,99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Sans engagement
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-4">
                {[
                  "Accès illimité à Élia (assistant IA)",
                  "Génération de contenus pédagogiques",
                  "Sauvegarde de vos documents",
                  "Support client prioritaire",
                  "+ 10h économisées/semaine",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-coral-400 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleStartTrial} 
              className="w-full mt-8 bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white hover:opacity-90"
            >
              Commencer l'essai gratuit
            </Button>
          </Card>

          {/* Plan Annuel */}
          <Card className="p-8 relative border-2 border-coral-400/20 shadow-premium hover:shadow-premium-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white">
                <Crown className="w-4 h-4 mr-1" />
                Meilleure offre
              </Badge>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Annuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 bg-clip-text text-transparent">4,99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-coral-400 mt-2">
                Facturé annuellement (59,99€/an)
              </p>
              <p className="text-sm font-medium text-coral-400 mt-1">
                Économisez plus de 45€ par an !
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-4">
                {[
                  "Tous les bénéfices de l'abonnement mensuel",
                  "Prix réduit garanti à vie (-45€/an)",
                  "Accès prioritaire aux nouvelles fonctionnalités",
                  "Stockage plus élevé de l'historique",
                  "Support client téléphonique",
                  {
                    text: "Garantie satisfait ou remboursé",
                    tooltip: "Remboursement intégral pendant les 30 premiers jours"
                  },
                  "Badge 'Membre Premium' dans la communauté",
                  "Vote prioritaire sur les futures fonctionnalités"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-coral-400 mt-0.5" />
                    <span className="text-muted-foreground">
                      {typeof feature === 'string' ? (
                        feature
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 cursor-help">
                              {feature.text}
                              <Info className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleStartTrial} 
              className="w-full mt-8 bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white hover:opacity-90"
            >
              Commencer l'essai gratuit
            </Button>
          </Card>
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h4 className="font-semibold mb-8 text-coral-400">Notre engagement qualité</h4>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Timer className="w-8 h-8 mb-4 text-coral-400" />,
                title: "Support réactif",
                description: "Une équipe dédiée à votre réussite"
              },
              {
                icon: <Shield className="w-8 h-8 mb-4 text-coral-400" />,
                title: "Satisfaction garantie",
                description: "30 jours pour essayer sans risque"
              },
              {
                icon: <Trophy className="w-8 h-8 mb-4 text-coral-400" />,
                title: "Mises à jour régulières",
                description: "De nouvelles fonctionnalités chaque mois"
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center">{item.icon}</div>
                <h5 className="font-medium mb-2 text-foreground">{item.title}</h5>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage
