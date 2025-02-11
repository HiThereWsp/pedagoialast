
import { useState } from "react"
import { toast } from "sonner"

interface FormData {
  etablissement: string
  taille: string
  contactName: string
  email: string
  phone: string
}

export const usePricingForm = () => {
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
      console.log("URL:", import.meta.env.VITE_PUBLIC_SUPABASE_URL)
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/add-to-brevo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`
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

  const setEtablissement = (type: string) => {
    setFormData({ ...formData, etablissement: type })
    nextStep()
  }

  const setTaille = (size: string) => {
    setFormData({ ...formData, taille: size })
    nextStep()
  }

  return {
    step,
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    setEtablissement,
    setTaille
  }
}
