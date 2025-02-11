
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

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
      const { error } = await supabase.functions.invoke('add-to-brevo', {
        body: formData
      })

      if (error) {
        throw error
      }

      nextStep()
      toast.success("Votre demande a été enregistrée avec succès !")
    } catch (error) {
      console.error('Error:', error)
      toast.error("Une erreur est survenue, veuillez réessayer.")
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
