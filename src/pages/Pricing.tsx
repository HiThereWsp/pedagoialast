import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Info, MessageSquareText, Star } from "lucide-react"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

const PricingPage = () => {
  const navigate = useNavigate()

  const handleSubscription = async (priceId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast.error("Vous devez être connecté pour souscrire à un abonnement")
      navigate("/login")
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || "Une erreur est survenue")
    }
  }

  const handleMonthlySubscription = () => {
    handleSubscription('price_1OvCYXIqXQKnGj4mJHYz8j9Q') // À remplacer par votre ID de prix mensuel
  }

  const handleYearlySubscription = () => {
    handleSubscription('price_1OvCZ3IqXQKnGj4mzpVrXkUx') // À remplacer par votre ID de prix annuel
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Découvrez la puissance de l'intelligence artificielle dans votre métier grâce à PedagoIA
          </h1>
          <Badge variant="secondary" className="mb-4 bg-secondary text-primary">
            <MessageSquareText className="w-4 h-4 mr-1" />
            Essai gratuit de 7 jours
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Mensuel */}
          <Card className="p-8 relative hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-secondary text-primary/90">
                <MessageSquareText className="w-4 h-4 mr-1" />
                Plan Flexible
              </Badge>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Mensuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">7,99€</span>
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
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleMonthlySubscription} 
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              Commencer l'essai gratuit
            </Button>
          </Card>

          {/* Plan Annuel */}
          <Card className="p-8 relative border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white">
                <Crown className="w-4 h-4 mr-1" />
                Meilleure offre
              </Badge>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Annuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">59,99€</span>
                <span className="text-muted-foreground">/an</span>
              </div>
              <p className="text-sm text-primary mt-2">
                Soit 5€/mois
              </p>
              <p className="text-sm font-medium text-primary mt-1">
                Économisez plus de 35€ par an !
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary mt-0.5 fill-primary" />
                  <span className="text-muted-foreground">Tous les avantages du plan mensuel</span>
                </li>
                {[
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
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 fill-primary" />
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
              onClick={handleYearlySubscription} 
              className="w-full mt-8 bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white hover:opacity-90 transition-opacity"
            >
              Souscrire à l'offre annuelle
            </Button>
          </Card>
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h4 className="font-semibold mb-8 text-primary">Notre engagement qualité</h4>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <MessageSquareText className="w-8 h-8 mb-4 text-primary" />,
                title: "Support réactif",
                description: "Une équipe dédiée à votre réussite"
              },
              {
                icon: <Crown className="w-8 h-8 mb-4 text-primary" />,
                title: "Satisfaction garantie",
                description: "30 jours pour essayer sans risque"
              },
              {
                icon: <Star className="w-8 h-8 mb-4 text-primary" />,
                title: "Mises à jour régulières",
                description: "De nouvelles fonctionnalités chaque mois"
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 shadow-lg">
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
