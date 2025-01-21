import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { AuthError, AuthApiError } from "@supabase/supabase-js"

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

const getErrorMessage = (error: AuthError) => {
  if (error instanceof AuthApiError) {
    switch (error.status) {
      case 400:
        if (error.message.includes("Email not confirmed")) {
          return "Veuillez confirmer votre email avant de vous connecter."
        }
        if (error.message.includes("Invalid login credentials")) {
          return "Email ou mot de passe incorrect."
        }
        return "Les identifiants fournis sont invalides."
      case 422:
        return "Format d'email invalide."
      case 429:
        return "Trop de tentatives. Veuillez réessayer plus tard."
      case 500:
        if (error.message.includes("Database error saving new user")) {
          return "Erreur lors de la création du profil. Veuillez réessayer."
        }
        return "Une erreur serveur est survenue. Veuillez réessayer plus tard."
      default:
        return error.message
    }
  }
  return "Une erreur est survenue. Veuillez réessayer."
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

  const validateForm = () => {
    if (!formState.email || !formState.password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
      })
      return false
    }

    if (formState.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
      })
      return false
    }

    return true
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

    if (!validateForm()) return

    setField("isLoading", true)

    try {
      console.log("Starting signup process with:", {
        email: formState.email,
        firstName: formState.firstName,
        metadata: { first_name: formState.firstName }
      })

      const { data, error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName
          }
        }
      })
      
      if (error) {
        console.error("Signup error details:", {
          status: error.status,
          message: error.message,
          name: error.name
        })
        throw error
      }

      console.log("Signup successful:", data)

      toast({
        title: "Inscription réussie",
        description: "Vérifiez vos emails pour confirmer votre inscription.",
      })
      onSuccess?.()
    } catch (error: any) {
      console.error("Full signup error details:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: getErrorMessage(error),
      })
    } finally {
      setField("isLoading", false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setField("isLoading", true)

    try {
      console.log("Starting signin process with:", {
        email: formState.email
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password
      })
      
      if (error) {
        console.error("Signin error details:", {
          status: error.status,
          message: error.message,
          name: error.name
        })
        throw error
      }

      console.log("Signin successful:", data)

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })
      onSuccess?.()
    } catch (error: any) {
      console.error("Full signin error details:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: getErrorMessage(error),
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