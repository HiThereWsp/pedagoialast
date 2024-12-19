import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Essai gratuit de 7 jours
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Commencez gratuitement avec Élia
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Testez toutes les fonctionnalités pendant 7 jours, sans engagement
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>Pas de carte bancaire requise pour l'essai</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Mensuel */}
          <Card className="p-8 relative">
            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Mensuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">8,99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Sans engagement
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-4">
                {[
                  "Accès illimité à Élia",
                  "Génération de contenus pédagogiques",
                  "Sauvegarde de vos documents",
                  "Support client prioritaire",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleStartTrial} 
              variant="outline"
              className="w-full mt-8"
            >
              Commencer l'essai gratuit
            </Button>
          </Card>

          {/* Plan Annuel */}
          <Card className="p-8 relative border-2 border-primary shadow-premium">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-1" />
              Le plus avantageux
            </Badge>

            <div>
              <h3 className="text-2xl font-bold mb-2">Plan Annuel</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">4,99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-primary mt-2">
                Facturé annuellement (59,99€/an)
              </p>
              <p className="text-sm text-primary">
                Économisez plus de 45€ par an !
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-4">
                {[
                  "Tout du plan mensuel",
                  "Prix réduit garanti à vie",
                  "Accès prioritaire aux nouvelles fonctionnalités",
                  {
                    text: "Garantie satisfait ou remboursé",
                    tooltip: "Remboursement intégral pendant les 30 premiers jours"
                  }
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
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
              className="w-full mt-8"
            >
              Commencer l'essai gratuit
            </Button>
          </Card>
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h4 className="font-semibold mb-8">Notre engagement qualité</h4>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Support réactif",
                description: "Une équipe dédiée à votre réussite"
              },
              {
                title: "Satisfaction garantie",
                description: "30 jours pour essayer sans risque"
              },
              {
                title: "Mises à jour régulières",
                description: "De nouvelles fonctionnalités chaque mois"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <h5 className="font-medium mb-2">{item.title}</h5>
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