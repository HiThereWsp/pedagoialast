
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AuthError } from "@supabase/supabase-js"

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

    try {
      if (!formState.email || !formState.password) {
        throw new Error("Email et mot de passe requis")
      }

      // Make sure firstName is properly handled - don't pass empty strings
      const firstName = formState.firstName && formState.firstName.trim() !== "" 
        ? formState.firstName.trim() 
        : null;

      console.log("Attempting signup with data:", {
        email: formState.email,
        firstName: firstName
      });

      // Première vérification - exécuter une opération d'authentification légère pour voir si l'utilisateur existe
      const { data: { user: existingUser }, error: checkError } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: firstName
          }
        }
      })

      // Si un utilisateur est retourné mais qu'il est déjà confirmé, cela indique probablement un compte existant
      if (existingUser && existingUser.identities && existingUser.identities.length === 0) {
        // Cela signifie que l'utilisateur existe déjà
        throw new AuthError("User already registered", 400)
      }

      if (checkError) {
        console.error("Supabase signup error:", checkError);
        throw checkError
      }

      setSignUpSuccess(true)
    } catch (error) {
      console.error("Signup error details:", error);
      if (error instanceof AuthError) {
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
    signUpSuccess
  }
}
