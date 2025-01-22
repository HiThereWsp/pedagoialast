import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  const handleEmailClick = () => {
    const mailtoUrl = `mailto:${email}`
    window.location.href = mailtoUrl
    toast({
      title: "Ouverture de votre client mail",
      description: "Votre client mail par défaut va s'ouvrir automatiquement.",
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
              Nous sommes à votre écoute pour toute demande concernant PedagoIA et son utilisation dans votre établissement.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-muted-foreground">
              N'hésitez pas à nous contacter si :
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Vous avez des questions sur l'utilisation de PedagoIA</li>
              <li>Vous souhaitez nous faire part de vos suggestions d'amélioration</li>
              <li>Vous souhaitez partager votre retour d'expérience</li>
              <li>Vous rencontrez des problèmes techniques</li>
              <li>Vous souhaitez adapter PedagoIA à votre établissement pour votre équipe pédagogique</li>
              <li>Vous souhaitez devenir ambassadeur de PedagoIA</li>
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
                  onClick={handleEmailClick}
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