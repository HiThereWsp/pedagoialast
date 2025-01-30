import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { getAuthErrorMessage, validatePasswordResetForm } from "@/utils/auth-error-handler"
import { useNavigate } from "react-router-dom"  // For navigation in React

interface AuthFormState {
    password: string
    confirmPassword: string
    isLoading: boolean,
    isSuccess: boolean
}

interface AuthFormProps {
    onSuccess?: () => void
}

export const usePasswordResetForm = ({ onSuccess }: AuthFormProps = {}) => {
    const [formState, setFormState] = useState<AuthFormState>({
        password: "",
        confirmPassword: "",
        isLoading: false,
        isSuccess: false
    })
    const { toast } = useToast()
    const navigate = useNavigate() // To navigate to home

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

    const HandlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate password
        const errors = validatePasswordResetForm(formState.password, formState.confirmPassword)
        if (handleValidationErrors(errors)) return

        setField("isLoading", true)

        try {
            console.log("Starting password reset process with:", {
                password: formState.password
            })

            const { data, error } = await supabase.auth.updateUser({
                password: formState.password
            })

            if (error) throw error

            console.log("Password reset successful:", data)

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
