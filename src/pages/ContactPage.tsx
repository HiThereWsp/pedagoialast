import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SEO } from "@/components/SEO"
import { Link } from "react-router-dom"

export default function ContactPage() {
  const { toast } = useToast()
  const email = "bonjour@pedagoia.fr"

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    toast({
      title: "Email copié",
      description: "L'adresse email a été copiée",
    })
  }

  return (
    <>
      <SEO 
        title="Contact | PedagoIA"
        description="Contactez-nous pour toute question sur PedagoIA"
      />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/home" className="block mb-8">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="w-[100px] h-[120px] object-contain mx-auto" 
            />
          </Link>
          <Card className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-primary mb-3">
                Contactez-nous
              </h1>
              <p className="text-muted-foreground">
                Je suis à votre écoute pour toutes vos questions, Andy.
              </p>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-md mb-3">
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
              
              <p className="text-sm text-muted-foreground">
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
