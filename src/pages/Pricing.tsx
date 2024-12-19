import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Commencez gratuitement avec Élia
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Essayez toutes les fonctionnalités pendant 7 jours sans engagement
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>Pas de carte bancaire requise</span>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="secondary" className="font-medium">
              7 jours d'essai gratuit
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Mensuel</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">8,99€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </div>
              <Button 
                onClick={handleStartTrial} 
                className="w-full"
              >
                Commencer l'essai gratuit
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Annuel</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">59,99€</span>
                  <span className="text-muted-foreground">/an</span>
                </div>
                <p className="text-sm text-primary mt-1">
                  Économisez plus de 45€ par an
                </p>
              </div>
              <Button 
                onClick={handleStartTrial} 
                className="w-full"
                variant="outline"
              >
                Commencer l'essai gratuit
              </Button>
            </div>
          </div>

          <div className="mt-12">
            <h4 className="font-semibold mb-4">Tout est inclus :</h4>
            <ul className="grid gap-3">
              {[
                "Accès illimité à Élia",
                "Génération de contenus pédagogiques",
                "Sauvegarde de vos documents",
                "Support client prioritaire",
                "Mises à jour régulières",
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
                          <TooltipTrigger className="flex items-center gap-1">
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

          <div className="mt-12 pt-8 border-t">
            <h4 className="font-semibold mb-4">Notre engagement qualité</h4>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Support réactif",
                  description: "Une équipe dédiée à votre réussite"
                },
                {
                  title: "Mises à jour régulières",
                  description: "De nouvelles fonctionnalités chaque mois"
                },
                {
                  title: "Satisfaction garantie",
                  description: "30 jours pour essayer sans risque"
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
        </Card>
      </main>
    </div>
  )
}

export default PricingPage