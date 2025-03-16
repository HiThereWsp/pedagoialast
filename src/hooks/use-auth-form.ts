
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AuthError, AuthApiError } from "@supabase/supabase-js"
import { isUserExistsError } from "@/utils/auth-error-handler"

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

      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      })

      if (error) {
        throw error
      }

    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new Error("Erreur lors de la connexion")
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
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

      console.log(`Tentative d'inscription avec email: ${formState.email}`)
      
      const { error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName || null
          }
        }
      })

      console.log(`Résultat de la tentative d'inscription:`, error ? `Erreur: ${error.message}` : "Succès")

      if (error) {
        // Si c'est une erreur d'utilisateur existant, on la gère spécifiquement
        if (isUserExistsError(error)) {
          console.log("Utilisateur existant détecté via l'erreur de Supabase")
          setExistingUserDetected(true)
          return
        }
        throw error
      }

      setSignUpSuccess(true)
    } catch (error) {
      if (error instanceof AuthError) {
        // Double vérification pour les erreurs d'utilisateur existant
        if (isUserExistsError(error)) {
          console.log("Utilisateur existant détecté via AuthError")
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
