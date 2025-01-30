import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { getAuthErrorMessage, validateForgotPasswordForm } from "@/utils/auth-error-handler"
import { useNavigate } from "react-router-dom"  // For navigation in React

interface ForgotPasswordFormState {
    email: string,
    isLoading: boolean,
    isSuccess: boolean

}

interface AuthFormProps {
    onSuccess?: () => void
}

export const useForgotPasswordForm = ({ onSuccess }: AuthFormProps = {}) => {
    const [formState, setFormState] = useState<ForgotPasswordFormState>({
        email: "",
        isLoading: false,
        isSuccess: false
    })
    const { toast } = useToast()
    const navigate = useNavigate() // To navigate to home

    const setField = (field: keyof ForgotPasswordFormState, value: any) => {
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

    const HandlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate password
        const errors = validateForgotPasswordForm(formState.email)
        if (handleValidationErrors(errors)) return

        setField("isLoading", true)

        try {
            console.log("Starting to send forgot password request", {
                email: formState.email
            })

            const { data, error } = await supabase.auth.resetPasswordForEmail(
                formState.email)

            if (error) throw error

            console.log("Password reset Email sent.", data)

            toast({
                title: "Réinitialisation réussie",
                description: "Votre mot de passe a été réinitialisé avec succès.",
            })

            // Set the success state to true
            setField("isSuccess", true)
            onSuccess?.()
        } catch (error: any) {
            console.error("Password reset error:", error)
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
        HandlePasswordReset,
        navigate
    }
}
