import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const email = "admin@pedagoia.fr"

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    toast({
      title: "Adresse email copiée !",
      description: "L'adresse email a été copiée dans votre presse-papier.",
    })
  }

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

            <div className="mt-8 text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-md">
                <span className="text-muted-foreground select-all">{email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyEmail}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => window.location.href = `mailto:${email}`}
                >
                  <Mail className="w-5 h-5" />
                  Ouvrir dans votre client mail
                </Button>
                <p className="text-sm text-muted-foreground">
                  Notre équipe vous répondra dans les meilleurs délais
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}