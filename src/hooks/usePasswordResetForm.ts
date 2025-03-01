
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
            console.log("Démarrage du processus de réinitialisation avec:", {
                password: formState.password ? "Mot de passe présent" : "Mot de passe manquant"
            })

            const { data, error } = await supabase.auth.updateUser({
                password: formState.password
            })

            if (error) {
                console.error("Erreur de réinitialisation:", error)
                throw error
            }

            console.log("Réinitialisation réussie:", data)

            toast({
                title: "Réinitialisation réussie",
                description: "Votre mot de passe a été réinitialisé avec succès.",
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
            })
            throw error; // Rejeter l'erreur pour que le composant puisse la gérer
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
