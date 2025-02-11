
import { useState } from "react"
import { ChevronRight, School, Users, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface FormData {
  etablissement: string
  taille: string
  contactName: string
  email: string
  phone: string
}

export const PricingForm = () => {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    etablissement: '',
    taille: '',
    contactName: '',
    email: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-to-brevo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du contact")
      }

      nextStep()
      toast.success("Votre demande a été enregistrée avec succès !")
    } catch (error) {
      toast.error("Une erreur est survenue, veuillez réessayer.")
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Quel type d'établissement dirigez-vous ?</h2>
            <div className="grid gap-4">
              {['École primaire', 'Collège', 'Lycée', 'Université', 'Centre de formation'].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => {
                    setFormData({ ...formData, etablissement: type })
                    nextStep()
                  }}
                  className="flex items-center justify-between p-6 h-auto hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <School className="text-primary h-5 w-5" />
                    <span>{type}</span>
                  </div>
                  <ChevronRight className="text-primary h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Combien d'enseignants compte votre établissement ?</h2>
            <div className="grid gap-4">
              {[
                'Moins de 10 enseignants',
                '10 à 25 enseignants',
                '25 à 50 enseignants',
                'Plus de 50 enseignants'
              ].map((size) => (
                <Button
                  key={size}
                  variant="outline"
                  onClick={() => {
                    setFormData({ ...formData, taille: size })
                    nextStep()
                  }}
                  className="flex items-center justify-between p-6 h-auto hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="text-primary h-5 w-5" />
                    <span>{size}</span>
                  </div>
                  <ChevronRight className="text-primary h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Dernière étape !</h2>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Laissez-nous vos coordonnées pour recevoir une proposition adaptée à vos besoins
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nom du directeur/directrice</Label>
                  <Input
                    type="text"
                    name="contactName"
                    id="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Prénom et Nom"
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-primary h-4 w-4" />
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nom@etablissement.fr"
                      className="pl-10 border-primary/20 focus:border-primary/40"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone portable</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-primary h-4 w-4" />
                    <Input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="06 XX XX XX XX"
                      className="pl-10 border-primary/20 focus:border-primary/40"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Envoi en cours..." : "Recevoir mon devis personnalisé"}
                </Button>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Merci !</h2>
            <p className="text-muted-foreground">
              Nous avons bien reçu votre demande. Notre équipe vous contactera très prochainement pour vous proposer une solution adaptée à vos besoins.
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Card className="max-w-md mx-auto p-6 border-primary/10">
      {step < 4 && (
        <div className="mb-8 space-y-2">
          <Progress value={(step / 3) * 100} className="h-2 bg-primary/10" />
          <p className="text-center text-sm text-muted-foreground">
            Étape {step}/3
          </p>
        </div>
      )}
      {renderStep()}
    </Card>
  )
}

export default PricingForm
