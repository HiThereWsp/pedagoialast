
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AuthError, AuthApiError } from "@supabase/supabase-js"
import { isUserExistsError } from "@/utils/auth-error-handler"
import { toast } from "sonner"

interface AuthFormState {
  email: string
  password: string
  firstName?: string
  acceptedTerms: boolean
  isLoading: boolean
}

export const useAuthForm = () => {
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    firstName: "",
    acceptedTerms: false,
    isLoading: false
  })

  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [existingUserDetected, setExistingUserDetected] = useState(false)

  const setField = (field: keyof AuthFormState, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState(prev => ({ ...prev, isLoading: true }))

    try {
      if (!formState.email || !formState.password) {
        throw new Error("Email et mot de passe requis")
      }

      console.log("Tentative de connexion avec:", formState.email)
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      })

      if (error) {
        console.error("Erreur de connexion:", error.message)
        throw error
      }

      console.log("Connexion réussie")

    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new Error("Erreur lors de la connexion")
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      console.log("Vérification si l'utilisateur existe:", email)
      
      // Méthode 1: Utiliser l'API signInWithPassword avec un mot de passe incorrect
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: `incorrect-password-${Date.now()}`,
      })

      // Si l'erreur indique des identifiants invalides, l'utilisateur existe
      if (error instanceof AuthApiError && 
          error.status === 400 && 
          error.message.includes("Invalid login credentials")) {
        console.log("Utilisateur existant détecté via méthode 1")
        return true
      }

      // Méthode 2: Si la méthode 1 ne détecte pas correctement, essayer de réinitialiser le mot de passe
      // Cette méthode est plus fiable car elle renvoie une erreur spécifique si l'email n'existe pas
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError && resetError.message.includes("Email not found")) {
        console.log("Email non trouvé via méthode 2")
        return false
      }

      // Si aucune erreur "Email not found", l'utilisateur existe probablement
      if (!resetError) {
        console.log("Utilisateur existant détecté via méthode 2")
        return true
      }

      // Par défaut, supposer que l'utilisateur n'existe pas
      return false
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error)
      return false
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState(prev => ({ ...prev, isLoading: true }))
    setExistingUserDetected(false)

    try {
      if (!formState.email || !formState.password) {
        throw new Error("Email et mot de passe requis")
      }

      // Vérifier si l'utilisateur existe déjà
      const exists = await checkUserExists(formState.email)
      if (exists) {
        console.log("Utilisateur existant détecté")
        setExistingUserDetected(true)
        setFormState(prev => ({ ...prev, isLoading: false }))
        return
      }

      console.log("Création d'un nouvel utilisateur:", formState.email)
      const { error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName || null
          }
        }
      })

      if (error) {
        // Si c'est une erreur d'utilisateur existant, on la gère spécifiquement
        if (isUserExistsError(error)) {
          console.log("Utilisateur existant détecté via erreur d'inscription")
          setExistingUserDetected(true)
          return
        }
        throw error
      }

      console.log("Inscription réussie")
      setSignUpSuccess(true)
    } catch (error) {
      if (error instanceof AuthError) {
        // Double vérification pour les erreurs d'utilisateur existant
        if (isUserExistsError(error)) {
          console.log("Utilisateur existant détecté via erreur d'inscription (catch)")
          setExistingUserDetected(true)
          return
        }
        throw error
      }
      throw new Error("Erreur lors de l'inscription")
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return {
    formState,
    setField,
    handleSignIn,
    handleSignUp,
    signUpSuccess,
    existingUserDetected,
    setExistingUserDetected
  }
}
