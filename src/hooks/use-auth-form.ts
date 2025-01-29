import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { getAuthErrorMessage, validateAuthForm } from "@/utils/auth-error-handler"

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
  const [signUpSuccess, setSignupSuccess] = useState(false)
  const { toast } = useToast()

  const setField = (field: keyof AuthFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: errors[0],
      })
      return true
    }
    return false
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateAuthForm(formState.email, formState.password)
    if (handleValidationErrors(errors)) return

    setField("isLoading", true)

    try {
      console.log("Starting signup process with:", {
        email: formState.email,
        firstName: formState.firstName,
      })

      const origin = window.location.origin
      const redirectTo = `${origin}/login`

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email.trim(),
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName?.trim() || null,
          },
          emailRedirectTo: redirectTo
        }
      })
      
      if (authError) throw authError

      console.log("Auth signup successful:", authData)

      toast({
        title: "Inscription réussie",
        description: "Vérifiez vos emails pour confirmer votre inscription.",
      })
      onSuccess?.()
      setSignupSuccess(true)

    } catch (error: any) {
      console.error("Full signup error details:", error)
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: getAuthErrorMessage(error),
      })
    } finally {
      setField("isLoading", false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateAuthForm(formState.email, formState.password)
    if (handleValidationErrors(errors)) return

    setField("isLoading", true)

    try {
      console.log("Starting signin process with:", {
        email: formState.email
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email.trim(),
        password: formState.password,
      })
      
      if (error) throw error

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
        description: getAuthErrorMessage(error),
      })
    } finally {
      setField("isLoading", false)
    }
  }

  return {
    formState,
    setField,
    handleSignUp,
    handleSignIn,
    signUpSuccess
  }
}

