
import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { getAuthErrorMessage, validatePasswordResetForm } from "@/utils/auth-error-handler"

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

    const setField = (field: keyof AuthFormState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
    }

    const handleValidationErrors = (errors: string[]) => {
        if (errors.length > 0) {
            toast({
                variant: "destructive",
                title: "Erreur de validation",
                description: errors[0],
                duration: 5000, // Plus de temps pour lire le message d'erreur
            })
            return true
        }
        return false
    }

    const HandlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()

        // Valider les mots de passe
        const errors = validatePasswordResetForm(formState.password, formState.confirmPassword)
        if (handleValidationErrors(errors)) return

        setField("isLoading", true)

        try {
            console.log("Démarrage du processus de mise à jour du mot de passe:", {
                passwordLength: formState.password ? formState.password.length : 0
            })

            const { data, error } = await supabase.auth.updateUser({
                password: formState.password
            })

            if (error) {
                console.error("Erreur lors de la mise à jour du mot de passe:", error)
                throw error
            }

            console.log("Mot de passe mis à jour avec succès:", data)

            toast({
                title: "Mot de passe mis à jour",
                description: "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.",
                duration: 5000,
            })

            // Mettre à jour l'état de succès
            setField("isSuccess", true)
            
            // Appeler le callback de succès si fourni
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            console.error("Erreur de réinitialisation:", error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: getAuthErrorMessage(error),
                duration: 5000,
            })
        } finally {
            setField("isLoading", false)
        }
    }

    return {
        formState,
        setField,
        HandlePasswordReset
    }
}
