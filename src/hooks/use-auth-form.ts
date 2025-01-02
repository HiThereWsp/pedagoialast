import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"

interface AuthFormState {
  email: string
  password: string
  firstName?: string
  acceptedTerms?: boolean
  isLoading: boolean
}

interface AuthFormProps {
  onSuccess?: () => void
}

export const useAuthForm = ({ onSuccess }: AuthFormProps = {}) => {
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    firstName: "",
    acceptedTerms: false,
    isLoading: false
  })
  const { toast } = useToast()

  const setField = (field: keyof AuthFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Veuillez accepter les conditions d'utilisation pour continuer.",
      })
      return
    }

    if (formState.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
      })
      return
    }

    setField("isLoading", true)

    try {
      const { error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName
          }
        }
      })
      
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Compte existant",
            description: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.",
          })
        } else if (error.message.includes("Invalid email")) {
          toast({
            variant: "destructive",
            title: "Email invalide",
            description: "Veuillez entrer une adresse email valide.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
          })
        }
        return
      }

      toast({
        title: "Inscription réussie",
        description: "Vérifiez vos emails pour confirmer votre inscription.",
      })
      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue est survenue. Veuillez réessayer.",
      })
    } finally {
      setField("isLoading", false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setField("isLoading", true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password
      })
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email non confirmé",
            description: "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.",
          })
        } else if (error.message.includes("Too many requests")) {
          toast({
            variant: "destructive",
            title: "Trop de tentatives",
            description: "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe."
          })
        }
        return
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })
      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue est survenue. Veuillez réessayer."
      })
    } finally {
      setField("isLoading", false)
    }
  }

  return {
    formState,
    setField,
    handleSignUp,
    handleSignIn
  }
}