import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { validateEmail, validatePhoneNumber } from "../utils/validations"
import { facebookEvents } from "@/integrations/meta-pixel/client"
import metaConversionsService from "@/services/metaConversionsService"

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
    // Envoyer l'événement pixel pour la progression
    facebookEvents.schoolFormStep(step + 1)
    
    // Envoyer l'événement CAPI pour la progression (Lead)
    // Pas besoin d'envoyer l'email ici car il n'est peut-être pas encore saisi/validé
    // On pourrait l'envoyer à la fin si nécessaire
    const testEventCode = import.meta.env.VITE_META_TEST_EVENT_CODE || undefined
    metaConversionsService.sendLeadEvent(
      { /* Données utilisateur potentiellement vides ou partielles ici */ }, 
      'school_form_progress', 
      step + 1,
      {
         test_event_code: testEventCode
      }
    ).catch(error => {
        console.error(`[Meta CAPI] Failed to send school_form_progress (step ${step + 1}) event:`, error)
    })
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
      console.log("Submitting form data to create-school-contact", formData)
      
      // Using the dedicated create-school-contact function for school submissions
      const { data, error } = await supabase.functions.invoke('create-school-contact', {
        body: {
          email: formData.email,
          contactName: formData.contactName,
          etablissement: formData.etablissement,
          taille: formData.taille,
          phone: formData.phoneNumber
        }
      })

      if (error) {
        console.error("Error calling edge function:", error)
        throw error
      }

      console.log("Form submission response:", data)
      
      // Envoyer l'événement pixel pour la complétion
      facebookEvents.schoolFormStep(4)
      
      // Envoyer l'événement CAPI pour la complétion (Lead)
      const testEventCode = import.meta.env.VITE_META_TEST_EVENT_CODE || undefined
      metaConversionsService.sendLeadEvent(
        { 
          email: formData.email, // Envoyer l'email car il est validé ici
          firstName: formData.contactName,
          phone: formData.phoneNumber 
        }, 
        'school_form_complete', 
        4,
        {
          test_event_code: testEventCode
        }
      ).catch(error => {
        console.error('[Meta CAPI] Failed to send school_form_complete event:', error)
      })

      nextStep() // Avance à l'étape 4 (confirmation)
      toast.success("Votre demande a été enregistrée avec succès !")
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error("Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const setEtablissement = (type: string) => {
    setFormData({ ...formData, etablissement: type })
    nextStep() // nextStep envoie déjà l'événement pixel et CAPI
  }

  const setTaille = (size: string) => {
    setFormData({ ...formData, taille: size })
    nextStep() // nextStep envoie déjà l'événement pixel et CAPI
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
