import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground">
              Nous sommes actuellement en version bêta et travaillons constamment à améliorer PedagoIA pour vous offrir la meilleure expérience possible.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-muted-foreground">
              Vos retours sont précieux pour nous aider à façonner un outil qui répond au mieux à vos besoins. N'hésitez pas à nous partager vos :
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Questions sur l'utilisation de PedagoIA</li>
              <li>Suggestions d'amélioration</li>
              <li>Retours d'expérience</li>
              <li>Problèmes techniques rencontrés</li>
            </ul>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => window.location.href = 'mailto:admin@pedagoia.fr'}
              >
                <Mail className="w-5 h-5" />
                Écrivez-nous
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Notre équipe vous répondra dans les meilleurs délais à admin@pedagoia.fr
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}