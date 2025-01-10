import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UseFormRegister, FieldErrors } from "react-hook-form"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

interface WaitlistFormFieldsProps {
  register: UseFormRegister<WaitlistFormData>
  errors: FieldErrors<WaitlistFormData>
  isLoading: boolean
}

export const WaitlistFormFields = ({ register, errors, isLoading }: WaitlistFormFieldsProps) => {
  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      <div>
        <Input
          placeholder="Votre prénom"
          {...register("firstName", { required: "Le prénom est requis" })}
          className="w-full"
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Votre email"
          {...register("email", { 
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email invalide"
            }
          })}
          className="w-full"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Votre niveau d'enseignement"
          {...register("teachingLevel", { required: "Le niveau d'enseignement est requis" })}
          className="w-full resize-none"
          disabled={isLoading}
        />
        {errors.teachingLevel && (
          <p className="text-sm text-red-500 mt-1">{errors.teachingLevel.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Je m'inscris à la liste d'attente"
        )}
      </Button>
    </div>
  )
}