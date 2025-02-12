
import { Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface StepThreeProps {
  formData: {
    contactName: string
    email: string
    phoneNumber: string
  }
  errors: {
    email: boolean
    phone: boolean
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const StepThree = ({ 
  formData, 
  errors, 
  onChange, 
  onSubmit, 
  isSubmitting 
}: StepThreeProps) => {
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
              onChange={onChange}
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
                onChange={onChange}
                placeholder="nom@etablissement.fr"
                className={`pl-10 border-primary/20 focus:border-primary/40 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">
                Veuillez entrer une adresse email valide
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone portable</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-primary h-4 w-4" />
              <Input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={onChange}
                placeholder="+33 6 12 34 56 78"
                className={`pl-10 border-primary/20 focus:border-primary/40 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">
                Veuillez entrer un numéro de téléphone valide
              </p>
            )}
          </div>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Envoi en cours..." : "Recevoir mon devis personnalisé"}
          </Button>
        </div>
      </div>
    </div>
  )
}
