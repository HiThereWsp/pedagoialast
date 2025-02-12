
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { validateEmail, validatePhoneNumber } from "../utils/validations"

interface FormData {
  etablissement: string
  taille: string
  contactName: string
  email: string
  phoneNumber: string
}

export const usePricingForm = () => {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    etablissement: '',
    taille: '',
    contactName: '',
    email: '',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState({
    email: false,
    phone: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Validation en temps réel
    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: !validateEmail(value)
      }))
    }
    if (name === 'phoneNumber') {
      setErrors(prev => ({
        ...prev,
        phone: !validatePhoneNumber(value)
      }))
    }
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(formData.email)
    const isPhoneValid = validatePhoneNumber(formData.phoneNumber)
    
    setErrors({
      email: !isEmailValid,
      phone: !isPhoneValid
    })

    return isEmailValid && isPhoneValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.functions.invoke('add-to-brevo', {
        body: {
          ...formData,
          phone: formData.phoneNumber // Format complet du numéro
        }
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
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setEtablissement,
    setTaille
  }
}
